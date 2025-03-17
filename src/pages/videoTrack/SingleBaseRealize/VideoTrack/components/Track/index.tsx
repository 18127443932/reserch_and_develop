import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react'

type TrackProps = {
  url: string
  width: number
  blockHeight: number
  lineSpace: number
  contentWidth: number
  onLoaded: (video: HTMLVideoElement) => any
}
type ImgBlockSeg = {
  frameDuration: number
  startTime: number
  endTime: number
}

const dpi = window.devicePixelRatio || 1
const blockBuffer = {
  left: 1,
  right: 10,
}

const Track = forwardRef(function (props: TrackProps, ref) {
  const { url, width, lineSpace, blockHeight, onLoaded } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameDurationRef = useRef<number>(1000)
  // 视频块的缓存 key是当前块的开始时间，val是图片
  const bitMapCacheRef = useRef(new Map())
  const imageBlockSegmentsRef = useRef<[number, ImgBlockSeg[]] | []>([])
  const scrollXRef = useRef(0)
  const scrollYRef = useRef(0)
  const loadedRef = useRef(false)

  const blockWidth = () => {
    if (!videoRef.current) {
      return 0
    }
    const { videoWidth, videoHeight } = videoRef.current
    return (videoWidth / videoHeight) * blockHeight
  }

  useImperativeHandle(ref, () => ({
    // 滚动由外层直接调用，避免走 react diff
    scroll(x: number, y: number) {
      scrollXRef.current = x
      scrollYRef.current = y
      draw()
    },
    setFrameDuration(fameDuration: number) {
      frameDurationRef.current = fameDuration
      draw()
    },
    draw,
    bitMapCacheRef,
  }))

  useEffect(() => {
    if (url) {
      init()
    }
  }, [])

  function init() {
    videoRef.current = document.createElement('video')
    // 静音
    videoRef.current.muted = true
    videoRef.current.src = url
    // 当前播放位置的视频帧（通常是第一帧）加载完成后触发。
    videoRef.current.onloadeddata = handleVideoLoadeddata
    // 视频播放前 加载模式 metadata => 预加载元数据（如视频长度）
    videoRef.current.preload = 'metadata'
    canvasRef.current!.width = width * dpi
    canvasRef.current!.height = (lineSpace + blockHeight) * dpi
    canvasRef.current!.style.width = `${width}px`
    canvasRef.current!.style.height = `${lineSpace + blockHeight}px`
    const ctx = canvasRef.current!.getContext('2d')
    ctx!.scale(dpi, dpi)
  }
  function handleVideoLoadeddata() {
    if (!videoRef.current) {
      throw new Error('videoRef.current is null')
    }
    onLoaded?.(videoRef.current)
    loadedRef.current = true
    draw()
  }

  function calcImgBlocks() {
    if (!videoRef.current) {
      return []
    }
    let imgBlockSegments = []
    // 如有缓存，取缓存
    if (imageBlockSegmentsRef.current[0] === frameDurationRef.current) {
      imgBlockSegments = imageBlockSegmentsRef.current[1] as ImgBlockSeg[]
    } else {
      const { duration } = videoRef.current as HTMLVideoElement
      const durationMS = duration * 1000
      const fameDuration = frameDurationRef.current

      // 整理出需要多少视频帧，向上取整
      imgBlockSegments = new Array(Math.ceil(durationMS / fameDuration))
        .fill(true)
        .map((_, index, arr) => {
          return {
            frameDuration: index,
            startTime: index * frameDurationRef.current,
            endTime: arr[index + 1] ? (index + 1) * fameDuration : durationMS,
          }
        })
      imageBlockSegmentsRef.current = [fameDuration, imgBlockSegments]
    }

    // (左边划走的帧数(向下取整) - 缓冲区块数) * 帧时长
    const leftBoundTime =
      Math.floor(scrollXRef.current / blockWidth() - blockBuffer.left) *
      frameDurationRef.current
    // (右边划走的帧数(向上取整) + 缓冲区块数) * 帧时长
    const rightBoundTime =
      Math.ceil(
        (scrollXRef.current + width) / blockWidth() + blockBuffer.right
      ) * frameDurationRef.current
    // 过滤出来需要渲染的视频帧
    imgBlockSegments = imgBlockSegments.filter((seg) => {
      return seg.startTime >= leftBoundTime && seg.endTime <= rightBoundTime
    })
    return imgBlockSegments
  }

  // 获取位图资源信息
  const getResource = useCallback(
    async (currentSeg: ImgBlockSeg): Promise<ImageBitmap> => {
      const startTime = currentSeg.startTime
      const cache = bitMapCacheRef.current.get(startTime)
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

      bitMapCacheRef.current.set(startTime, source)
      return source
    },
    []
  )

  async function drawBlock(currentSeg: ImgBlockSeg) {
    if (!canvasRef.current || !videoRef.current) {
      throw new Error('canvasRef.current or videoRef.current is null')
    }
    const ctx = canvasRef.current.getContext('2d') as CanvasRenderingContext2D
    const source = await getResource(currentSeg)

    const { videoWidth, videoHeight } = videoRef.current
    const blockWidth = (videoWidth / videoHeight) * blockHeight
    const sourceX = 0
    const sourceY = 0
    const sourceWidth = videoWidth
    const sourceHeight = videoHeight
    const imgX =
      (currentSeg.startTime / frameDurationRef.current) * blockWidth -
      scrollXRef.current
    const imgY = lineSpace
    const imgWidth = blockWidth
    const imgHeight = blockHeight

    // 填充视频块
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
    ctx.strokeStyle = '#1759DD'
    ctx.fillStyle = '#f00'
    ctx.font = '12px serif'

    ctx.strokeRect(imgX, imgY, imgWidth, imgHeight)
    ctx.fillText(`${Math.floor(currentSeg.startTime)}`, imgX, imgY)
  }

  // 填充视频帧
  async function draw() {
    if (!loadedRef.current || !canvasRef.current) {
      return
    }
    const ctx = canvasRef.current.getContext('2d') as CanvasRenderingContext2D
    const imageBlockSegments = calcImgBlocks()
    const rest: ImgBlockSeg[] = []

    ctx.clearRect(0, 0, canvasRef.current.width, lineSpace + blockHeight)
    // 找出已经有缓存的抽帧图，优先画完
    for (let i = 0; i < imageBlockSegments.length; i++) {
      const cache = bitMapCacheRef.current.get(imageBlockSegments[i].startTime)
      if (cache) {
        drawBlock(imageBlockSegments[i])
      } else {
        rest.push(imageBlockSegments[i])
      }
    }
    // 画新的抽帧图
    for (let i = 0; i < rest.length; i++) {
      // 画抽帧图
      await drawBlock(rest[i])
    }
  }
  return <canvas ref={canvasRef} />
})

Track.displayName = 'Track'
export default Track
