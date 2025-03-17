import { Slider, Button } from '@arco-design/web-react'
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react'
import styles from './index.module.less'

const url =
  'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4'
const dpi = window.devicePixelRatio || 1

interface TrackProps {
  url: string
  blockHeight: number
  onLoaded?: () => void
}

interface TrackRef {
  scale: (rate: number) => void
  draw: () => Promise<void>
}

interface ImageBlockSegment {
  id: number
  startTime: number
  endTime: number
}

export default function BaseRealize() {
  const trackRef = useRef<TrackRef>(null)
  const [canShowTrack, setCanShowTrack] = useState(false)
  const handleDraw = useCallback(() => {
    trackRef.current?.draw()
  }, [])
  const handleScaleChange = useCallback((val: number | number[]) => {
    if (typeof val === 'number') {
      trackRef.current?.scale(val)
    }
  }, [])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>视频轨道（无虚拟滚动优化）</h1>
      <div className={styles.controls}>
        <div className={styles.buttonGroup}>
          <Button type="primary" disabled={!canShowTrack} onClick={handleDraw}>
            显示轨道
          </Button>
        </div>
        <div className={styles.sliderGroup}>
          <span className={styles.label}>调整缩放(毫秒/帧):</span>
          <Slider
            disabled={!canShowTrack}
            defaultValue={1000}
            min={10}
            max={10000}
            step={100}
            onChange={handleScaleChange}
          />
        </div>
      </div>
      <div className={styles.content}>
        <Track
          url={url}
          ref={trackRef}
          blockHeight={60}
          onLoaded={() => {
            setCanShowTrack(true)
          }}
        />
      </div>
    </div>
  )
}

const Track = forwardRef(function Track(
  props: TrackProps,
  ref: ForwardedRef<TrackRef>
) {
  const { url, blockHeight, onLoaded } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fameDuration = useRef<number>(1000) // 毫秒/帧
  const durationRef = useRef<number>(0) // 视频总时长，单位: ms

  const blockWidth = useRef<number>(0) // 绘制帧块的宽度， 宽度根据视频宽高计算
  const lineSpace = 20 // 顶部文字的行间距

  const frameStore = useRef<Map<number, ImageBitmap>>(
    new Map<number, ImageBitmap>()
  )

  useImperativeHandle(ref, () => ({
    scale(rate: number) {
      fameDuration.current = rate
      config()
      draw()
    },
    draw,
  }))

  useEffect(() => {
    if (url) {
      init()
      config()
    }
  }, [url])

  function init() {
    videoRef.current = document.createElement('video')
    videoRef.current.setAttribute('crossOrigin', 'Anonymous')
    videoRef.current.src = url
    videoRef.current.onloadeddata = handleVideoLoadeddata
    videoRef.current.preload = 'metadata'
  }

  function handleVideoLoadeddata() {
    onLoaded?.()
    config()
  }

  // 进行相关配置
  const config = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('videoRef.current or canvasRef.current is null')
      return
    }
    const { videoWidth, videoHeight, duration } = videoRef.current
    const durationMS = duration * 1000
    blockWidth.current = (videoWidth / videoHeight) * blockHeight
    durationRef.current = durationMS
    // 计算出 canvas 绘图尺寸及样式尺寸
    canvasRef.current.width =
      (durationMS / fameDuration.current) * blockWidth.current * dpi
    canvasRef.current.height = (lineSpace + blockHeight) * dpi
    canvasRef.current.style.width =
      (durationMS / fameDuration.current) * blockWidth.current + 'px'
    canvasRef.current.style.height = lineSpace + blockHeight + 'px'
    const ctx = canvasRef.current.getContext('2d')
    ctx?.scale(dpi, dpi)
  }, [dpi, blockHeight])

  // 获取需要绘制的块信息
  const getImgBlocks = useCallback((): ImageBlockSegment[] => {
    const imgBlockSegments = new Array(
      Math.ceil(durationRef.current / fameDuration.current)
    )
      .fill(true)
      .map((v, index, arr) => ({
        id: index,
        startTime: index * fameDuration.current,
        endTime: arr[index + 1]
          ? (index + 1) * fameDuration.current
          : durationRef.current,
      }))

    return imgBlockSegments
  }, [])

  // 获取位图资源信息
  const getResource = useCallback(
    async (currentSeg: ImageBlockSegment): Promise<ImageBitmap> => {
      const startTime = currentSeg.startTime
      const cache = frameStore.current.get(startTime)
      if (cache) return cache
      if (!videoRef.current) {
        throw new Error('videoRef.current is null')
      }
      videoRef.current.currentTime = startTime / 1000
      await new Promise((resolve) => {
        if (!videoRef.current) return
        videoRef.current.onseeked = () => {
          resolve('draw_track_seek_done')
        }
      })

      const source = await createImageBitmap(
        videoRef.current,
        0,
        0,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      )

      frameStore.current.set(startTime, source)
      return source
    },
    []
  )

  const drawBlock = useCallback(
    async (currentSeg: ImageBlockSegment) => {
      const ctx = canvasRef?.current?.getContext('2d')
      if (!canvasRef.current || !videoRef.current || !ctx) return

      const source: ImageBitmap = await getResource(currentSeg)
      const imgX =
        (currentSeg.startTime / fameDuration.current) * blockWidth.current
      const imgY = lineSpace
      const imgWidth = blockWidth.current
      const imgHeight = blockHeight

      ctx.drawImage(
        source,
        0,
        0,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight,
        imgX,
        imgY,
        imgWidth,
        imgHeight
      )
      ctx.strokeStyle = '#f00'
      ctx.fillStyle = '#f00'
      ctx.font = '12px serif'

      ctx.strokeRect(imgX, imgY, imgWidth, imgHeight)
      ctx.fillText(`${currentSeg.startTime}`, imgX, imgY)
    },
    [blockWidth]
  )

  const draw = useCallback(async () => {
    const ctx = canvasRef.current?.getContext('2d')
    const imageBlockSegments: ImageBlockSegment[] = getImgBlocks()
    if (!canvasRef.current || !ctx) return

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    for (let i = 0; i < imageBlockSegments.length; i++) {
      await drawBlock(imageBlockSegments[i])
    }
  }, [])

  return <canvas ref={canvasRef} />
})
