import {
  useEffect,
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react'
import { Slider, Button } from '@arco-design/web-react'

const url =
  'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4'
const dpi = window.devicePixelRatio || 1

const frameStore = new Map<number, ImageBitmap>()

const blockWidth = 60
const blockHeight = 60
const lineSpace = 20

interface TrackProps {
  url: string
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
  }, [trackRef])
  const handleScaleChange = useCallback(
    (val: number | number[]) => {
      if (typeof val === 'number') {
        trackRef.current?.scale(val)
      }
    },
    [trackRef]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: 20 }}>视频轨道（无虚拟滚动优化）</h1>
      <div>
        <Button disabled={!canShowTrack} onClick={handleDraw}>
          显示轨道
        </Button>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>调整缩放: </span>
          <Slider
            disabled={!canShowTrack}
            style={{ width: 200 }}
            defaultValue={1}
            min={1}
            max={1000}
            onChange={handleScaleChange}
          />
        </div>
      </div>
      <div style={{ overflow: 'scroll', width: 1000 }}>
        <Track
          url={url}
          ref={trackRef}
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
  const { url, onLoaded } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoWidthRef = useRef<number>(0)
  const videoHeightRef = useRef<number>(0)
  const imageBlockSegmentsRef = useRef<[number, ImageBlockSegment[]] | []>([])
  const currentDrawBeginAt = useRef<number>(0)
  const unitTimeRef = useRef<number>(1000)
  const durationRef = useRef<number>(0)

  useImperativeHandle(ref, () => ({
    scale(rate: number) {
      unitTimeRef.current = Math.floor((1 / rate) * 1000)
      if (!canvasRef.current) return
      canvasRef.current.width =
        (durationRef.current / unitTimeRef.current) * dpi
      canvasRef.current.height = (lineSpace + blockHeight) * dpi
      canvasRef.current.style.width =
        durationRef.current / unitTimeRef.current + 'px'
      canvasRef.current.style.height = lineSpace + blockHeight + 'px'
      const ctx = canvasRef.current.getContext('2d')
      ctx?.scale(dpi, dpi)
      draw()
    },
    draw,
  }))

  useEffect(() => {
    if (url) {
      init()
    }
  }, [url])

  function blockTime(): number {
    return unitTimeRef.current * blockWidth
  }

  function init() {
    videoRef.current = document.createElement('video')
    videoRef.current.setAttribute('crossOrigin', 'Anonymous')
    videoRef.current.src = url
    videoRef.current.onloadeddata = handleVideoLoadeddata
    videoRef.current.preload = 'metadata'
  }

  function handleVideoLoadeddata() {
    onLoaded?.()
    if (!videoRef.current) return
    const { videoWidth, videoHeight, duration } = videoRef.current

    const durationMS = duration * 1000
    videoWidthRef.current = videoWidth
    videoHeightRef.current = videoHeight
    durationRef.current = durationMS
    if (!canvasRef.current) return
    canvasRef.current.width = (durationMS / unitTimeRef.current) * dpi
    canvasRef.current.height = (lineSpace + blockHeight) * dpi
    canvasRef.current.style.width = durationMS / unitTimeRef.current + 'px'
    canvasRef.current.style.height = lineSpace + blockHeight + 'px'
    const ctx = canvasRef.current.getContext('2d')
    if (ctx) {
      ctx.scale(dpi, dpi)
    }
  }

  function calcImgBlocks(): ImageBlockSegment[] {
    const blockTimeVal = blockTime()

    const imgBlockSegments = new Array(
      Math.ceil(durationRef.current / blockTimeVal)
    )
      .fill(true)
      .map((v, index, arr) => ({
        id: index,
        startTime: index * blockTimeVal,
        endTime: arr[index + 1]
          ? (index + 1) * blockTimeVal
          : durationRef.current,
      }))
    console.log('imgBlockSegments', imgBlockSegments)

    return imgBlockSegments
  }

  async function drawBlock(id: number, currentSeg: ImageBlockSegment) {
    const timeAt = currentSeg.startTime
    const videoWidth = videoWidthRef.current
    const videoHeight = videoHeightRef.current
    const blockTimeVal = blockTime()

    if (id < currentDrawBeginAt.current) return

    if (!canvasRef.current || !videoRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    let source: ImageBitmap

    const exist = frameStore.get(timeAt)

    if (!exist) {
      console.log(timeAt / 1000, 'timeAt / 1000')
      videoRef.current.currentTime = timeAt / 1000
      await new Promise((resolve) => {
        if (!videoRef.current) return
        videoRef.current.onseeked = () => {
          resolve('draw_track_seek_done')
        }
      })
      if (id < currentDrawBeginAt.current) return

      const bm = await createImageBitmap(
        videoRef.current,
        0,
        0,
        videoWidth,
        videoHeight
      )
      if (id < currentDrawBeginAt.current) return

      frameStore.set(timeAt, bm)
      source = bm
    } else {
      source = exist
    }

    let sourceX = 0
    let sourceY = 0
    let sourceWidth = 0
    let sourceHeight = 0
    if (videoWidth / videoHeight > blockWidth / blockHeight) {
      sourceX = (videoWidth - videoHeight) / 2
      sourceY = 0
      sourceWidth =
        videoHeight *
        ((currentSeg.endTime - currentSeg.startTime) / blockTimeVal)
      sourceHeight = videoHeight
    } else {
      sourceX = 0
      sourceY = (videoHeight - videoWidth) / 2
      sourceWidth =
        videoWidth *
        ((currentSeg.endTime - currentSeg.startTime) / blockTimeVal)
      sourceHeight = videoWidth
    }
    const imgX = currentSeg.startTime / unitTimeRef.current
    const imgY = lineSpace
    const imgWidth =
      (currentSeg.endTime - currentSeg.startTime) / unitTimeRef.current
    const imgHeight = blockHeight

    console.log(
      source,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      imgX,
      imgY,
      imgWidth,
      imgHeight,
      'image'
    )

    ctx.drawImage(
      source,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
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
  }

  function drawBackground(id: number, start: number, end: number) {
    if (id < currentDrawBeginAt.current) return

    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.save()

    const imgX = start / unitTimeRef.current
    const imgY = lineSpace
    const imgWidth = (end - start) / unitTimeRef.current
    const imgHeight = blockHeight

    ctx.fillStyle = '#000'

    ctx.fillRect(imgX, imgY, imgWidth, imgHeight)
    ctx.restore()
  }

  async function draw() {
    currentDrawBeginAt.current = currentDrawBeginAt.current + 1
    const closureTime = currentDrawBeginAt.current
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(
      0,
      0,
      durationRef.current / unitTimeRef.current,
      lineSpace + blockHeight
    )

    let imageBlockSegments: ImageBlockSegment[]
    if (imageBlockSegmentsRef.current[0] === unitTimeRef.current) {
      const [, segments] = imageBlockSegmentsRef.current
      if (!segments) {
        imageBlockSegments = calcImgBlocks()
        imageBlockSegmentsRef.current = [
          unitTimeRef.current,
          imageBlockSegments,
        ]
      } else {
        imageBlockSegments = segments
      }
    } else {
      imageBlockSegments = calcImgBlocks()
      imageBlockSegmentsRef.current = [unitTimeRef.current, imageBlockSegments]
    }

    console.log(imageBlockSegments, 'imageBlockSegments')

    for (let i = 0; i < imageBlockSegments.length; i++) {
      drawBackground(
        closureTime,
        imageBlockSegments[i].startTime,
        imageBlockSegments[i].endTime
      )
    }

    for (let i = 0; i < imageBlockSegments.length; i++) {
      await drawBlock(closureTime, imageBlockSegments[i])
      if (closureTime < currentDrawBeginAt.current) return
    }
  }

  return <canvas ref={canvasRef} />
})
