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

const Track = forwardRef(function (props: TrackProps, ref) {
  const { url, width, lineSpace, blockHeight, onLoaded } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameDurationRef = useRef<number>(1000)
  const bitMapCacheRef = useRef(new Map<number, ImageBitmap>())
  const imageBlockSegmentsRef = useRef<[number, ImgBlockSeg[]] | []>([])
  const scrollXRef = useRef(0)
  const scrollYRef = useRef(0)
  const currentDrawBoundRef = useRef<[number, number]>([0, 0])
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
  }, [url])

  const init = useCallback(() => {
    if (!canvasRef.current) return
    videoRef.current = document.createElement('video')
    // 静音
    videoRef.current.muted = true
    videoRef.current.src = url
    // 当前播放位置的视频帧（通常是第一帧）加载完成后触发。
    videoRef.current.onloadeddata = handleVideoLoadeddata
    // 视频播放前 加载模式 metadata => 预加载元数据（如视频长度）
    videoRef.current.preload = 'metadata'
    canvasRef.current.width = width * dpi
    canvasRef.current.height = (lineSpace + blockHeight) * dpi
    canvasRef.current.style.width = `${width}px`
    canvasRef.current.style.height = `${lineSpace + blockHeight}px`
    const ctx = canvasRef.current!.getContext('2d')
    ctx?.scale(dpi, dpi)
  }, [url])

  const handleVideoLoadeddata = useCallback(() => {
    if (!videoRef.current) {
      throw new Error('videoRef.current is null')
    }
    onLoaded?.(videoRef.current)
    loadedRef.current = true
    draw()
  }, [onLoaded])

  // 获取需要绘制的视频帧列表
  const getImgBlocks = useCallback(() => {
    if (!videoRef.current) return []
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

    // 左边划走的帧数(向下取整) * 帧时长
    const leftBoundTime =
      Math.floor(scrollXRef.current / blockWidth()) * frameDurationRef.current
    // 右边划走的帧数(向上取整) * 帧时长
    const rightBoundTime =
      Math.ceil((scrollXRef.current + width) / blockWidth()) *
      frameDurationRef.current
    // 过滤出来需要渲染的视频帧
    imgBlockSegments = imgBlockSegments.filter((seg) => {
      return seg.startTime >= leftBoundTime && seg.endTime <= rightBoundTime
    })
    currentDrawBoundRef.current = [leftBoundTime, rightBoundTime]
    return imgBlockSegments
  }, [frameDurationRef.current])

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

  // 获取绘制信息
  const getDrawInfo = useCallback(
    (
      currentSeg: ImgBlockSeg
    ): {
      sourceX: number
      sourceY: number
      sourceWidth: number
      sourceHeight: number
      imgX: number
      imgY: number
      imgWidth: number
      imgHeight: number
    } => {
      if (!videoRef.current) {
        throw new Error('videoRef.current is null')
      }
      const { videoWidth, videoHeight } = videoRef.current
      const blockWidth = (videoWidth / videoHeight) * blockHeight
      const sourceX = 0
      const sourceY = lineSpace
      const sourceWidth = videoWidth
      const sourceHeight = videoHeight
      const imgX =
        (currentSeg.startTime / frameDurationRef.current) * blockWidth -
        scrollXRef.current
      const imgY = lineSpace
      const imgWidth = blockWidth
      const imgHeight = blockHeight
      return {
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        imgX,
        imgY,
        imgWidth,
        imgHeight,
      }
    },
    [lineSpace, blockHeight]
  )

  // 绘制视频块
  const drawBlock = useCallback(async (currentSeg: ImgBlockSeg) => {
    if (!canvasRef.current || !videoRef.current) {
      throw new Error('canvasRef.current or videoRef.current is null')
    }

    const ctx = canvasRef.current.getContext('2d') as CanvasRenderingContext2D
    const drawInfo = getDrawInfo(currentSeg)
    const source = await getResource(currentSeg)
    ctx.drawImage(
      source,
      drawInfo.sourceX,
      drawInfo.sourceY,
      drawInfo.sourceWidth,
      drawInfo.sourceHeight,
      drawInfo.imgX,
      drawInfo.imgY,
      drawInfo.imgWidth,
      drawInfo.imgHeight
    )
    drawBorderAndText(currentSeg, drawInfo)
  }, [])

  // 绘制边框和文字
  const drawBorderAndText = useCallback(
    (
      currentSeg: ImgBlockSeg,
      drawInfo:
        | {
            imgX: number
            imgY: number
            imgWidth: number
            imgHeight: number
          }
        | undefined = undefined
    ) => {
      if (!canvasRef.current || !videoRef.current) return
      const ctx = canvasRef.current.getContext('2d') as CanvasRenderingContext2D
      const { imgX, imgY, imgWidth, imgHeight } =
        drawInfo || getDrawInfo(currentSeg)
      ctx.strokeStyle = '#1759DD'
      ctx.fillStyle = '#f00'
      ctx.font = '12px serif'
      ctx.strokeRect(imgX, imgY, imgWidth, imgHeight)
      ctx.fillText(`${Math.floor(currentSeg.startTime)}`, imgX, imgY)
      ctx.strokeRect(imgX, imgY, imgWidth, imgHeight)
    },
    []
  )

  // 填充视频帧
  const draw = useCallback(async () => {
    if (!loadedRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d') as CanvasRenderingContext2D
    const imageBlockSegments = getImgBlocks()
    const blockList: ImgBlockSeg[] = []
    ctx.clearRect(0, 0, canvasRef.current.width, lineSpace + blockHeight)
    // 1.找出已经有缓存的抽帧图，优先画完
    for (let i = 0; i < imageBlockSegments.length; i++) {
      const cache = bitMapCacheRef.current.get(imageBlockSegments[i].startTime)
      if (cache) {
        drawBlock(imageBlockSegments[i])
      } else {
        blockList.push(imageBlockSegments[i])
      }
    }
    // 2. 先把框和文字绘制出来
    for (let i = 0; i < blockList.length; i++) {
      drawBorderAndText(blockList[i])
    }
    // 3. 异步绘制新的抽帧图
    for (let i = 0; i < blockList.length; i++) {
      const currentSeg = blockList[i]
      const [leftBoundTime, rightBoundTime] = currentDrawBoundRef.current
      // 优化：如果视频帧已不在当前绘制范围内，则不再绘制
      if (
        currentSeg.startTime >= leftBoundTime &&
        currentSeg.endTime <= rightBoundTime
      ) {
        await drawBlock(currentSeg)
      }
    }
  }, [])
  return <canvas ref={canvasRef} />
})

Track.displayName = 'Track'
export default Track
