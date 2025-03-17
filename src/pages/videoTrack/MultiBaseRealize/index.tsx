import { Slider, Button } from '@arco-design/web-react'
import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import styles from './index.module.less'

const url =
  'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4'
const dpi = window.devicePixelRatio || 1

const frameStore = new Map<number, ImageBitmap>()

const blockWidth = 60
const blockHeight = 60
const lineSpace = 20

const width = 1000
const height = 600

interface ScrollerProps {
  style?: React.CSSProperties
  contentWidth: number
  contentHeight: number
  onScroll?: (x: number, y: number) => void
  scrollX?: boolean
  scrollY?: boolean
  width: number
  height: number
  disabled?: boolean
  children: React.ReactNode
}

interface ScrollerRef {
  scrollTo: (x: number, y: number) => void
}

interface TrackProps {
  url: string
  onLoaded?: (duration: number) => void
  width: number
  height: number
  maxLineWidth: number
  onContentHeightChange?: (height: number) => void
}

interface TrackRef {
  scroll: (x: number, y: number) => void
  setUnitTime: (unitTime: number) => void
  draw: () => Promise<void>
}

interface ImageBlockSegment {
  id: number
  startTime: number
  endTime: number
  isBreakStart?: boolean
  isBreakTail?: boolean
}

export default function MultiBaseRealize() {
  const trackRef = useRef<TrackRef>(null)
  const scrollContainerRef = useRef<ScrollerRef>(null)
  const [duration, setDuration] = useState(0)
  const [unitTime, setUnitTime] = useState(1000)
  const [canShowTrack, setCanShowTrack] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)

  function handleScaleChange(val: number | number[]) {
    const unitTimeVal = Math.floor(
      (1 / (Array.isArray(val) ? val[0] : val)) * 1000
    )
    setUnitTime(unitTimeVal)
    trackRef.current?.setUnitTime(unitTimeVal)
  }

  function handleDraw() {
    trackRef.current?.draw()
  }

  function handleLoaded(val: number) {
    setDuration(val)
    setCanShowTrack(true)
  }

  function handleScroll(x: number, y: number) {
    trackRef.current?.scroll(x, y)
  }

  function handleContentHeightChange(val: number) {
    setContentHeight(val)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>多行视频轨道（虚拟滚动）</h1>
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
            defaultValue={1}
            min={1}
            max={1000}
            onChange={handleScaleChange}
          />
        </div>
      </div>
      <Scroller
        ref={scrollContainerRef}
        width={width}
        height={height}
        contentWidth={duration / unitTime}
        contentHeight={contentHeight}
        scrollY
        onScroll={handleScroll}
      >
        <Track
          key="static-track"
          url={url}
          ref={trackRef}
          onLoaded={handleLoaded}
          onContentHeightChange={handleContentHeightChange}
          maxLineWidth={width}
          width={width}
          height={height}
        />
      </Scroller>
    </div>
  )
}

const Scroller = forwardRef<ScrollerRef, ScrollerProps>(
  function Scroller(props, ref) {
    const {
      style,
      contentWidth,
      contentHeight,
      onScroll,
      scrollX = false,
      scrollY = false,
      width,
      height,
      disabled,
      children,
    } = props

    const [scrollXVal, setScrollXVal] = useState(0)
    const [scrollYVal, setScrollYVal] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const lastContetWidthRef = useRef(contentWidth)
    const lastContetHeightRef = useRef(contentHeight)

    useEffect(() => {
      if (!containerRef.current) return

      containerRef.current.addEventListener('wheel', handleWheel)
      return () => {
        if (!containerRef.current) return
        containerRef.current.removeEventListener('wheel', handleWheel)
      }
    }, [
      disabled,
      contentWidth,
      width,
      contentHeight,
      height,
      children,
      scrollX,
      scrollY,
      scrollXVal,
      scrollYVal,
      onScroll,
    ])

    // content发生改变时，修正scrollXVal和scrollYVal
    useEffect(() => {
      let nextScrollXVal = scrollXVal
      let nextScrollYVal = scrollYVal
      if (!disabled) {
        if (scrollX) {
          if (!lastContetWidthRef.current) {
            lastContetWidthRef.current = contentWidth
          } else {
            if (lastContetWidthRef.current !== contentWidth) {
              const lastScrollRatio = scrollXVal / lastContetWidthRef.current
              const viewRatio = Math.min(width / contentWidth, 1)
              // 滚动比例不能大于1 - viewRatio
              nextScrollXVal =
                Math.min(1 - viewRatio, lastScrollRatio) * contentWidth
              setScrollXVal(nextScrollXVal)
              lastContetWidthRef.current = contentWidth
            }
          }
        }
        if (scrollY) {
          if (!lastContetHeightRef.current) {
            lastContetHeightRef.current = contentHeight
          } else {
            if (lastContetHeightRef.current !== contentHeight) {
              const lastScrollRatio = scrollYVal / lastContetHeightRef.current
              const viewRatio = Math.min(height / contentHeight, 1)
              // 滚动比例不能大于1 - viewRatio
              nextScrollYVal =
                Math.min(1 - viewRatio, lastScrollRatio) * contentHeight
              setScrollYVal(nextScrollYVal)
              lastContetHeightRef.current = contentHeight
            }
          }
        }
        onScroll?.(nextScrollXVal, nextScrollYVal)
      }
    }, [contentWidth, contentHeight])

    function handleWheel(e: WheelEvent) {
      if (disabled) return
      e.stopPropagation()
      e.preventDefault()
      const { deltaX, deltaY } = e
      let nextScrollX = scrollXVal
      let nextScrollY = scrollYVal
      if (scrollX && deltaY + deltaX && contentWidth > width) {
        nextScrollX = scrollXVal + deltaY + deltaX
        if (nextScrollX < 0) {
          nextScrollX = 0
        } else if (nextScrollX > contentWidth - width) {
          nextScrollX = contentWidth - width
        }
        setScrollXVal(nextScrollX)
      }
      if (scrollY && deltaY && contentHeight > height) {
        nextScrollY = scrollYVal + deltaY
        if (nextScrollY < 0) {
          nextScrollY = 0
        } else if (nextScrollY > contentHeight - height) {
          nextScrollY = contentHeight - height
        }
        setScrollYVal(nextScrollY)
      }
      if (nextScrollX !== scrollXVal || nextScrollY !== scrollYVal) {
        onScroll?.(nextScrollX, nextScrollY)
      }
    }

    useImperativeHandle(ref, () => ({
      scrollTo: (x: number, y: number) => {
        setScrollXVal(x)
        setScrollYVal(y)
      },
    }))

    return (
      <div
        ref={containerRef}
        className={styles.scroller}
        style={{
          width,
          height,
          overflow: 'hidden',
          position: 'relative',
          ...style,
        }}
      >
        {children}
        {!disabled && scrollX && contentWidth > width && (
          <div
            className={styles.scrollBarX}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: (width / contentWidth) * width,
              height: 8,
              transform: `translateX(${scrollXVal * (width / contentWidth)}px) translateY(${height - 8}px)`,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 4,
            }}
          />
        )}
        {!disabled && scrollY && contentHeight > height && (
          <div
            className={styles.scrollBarY}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 8,
              height: (height / contentHeight) * height,
              transform: `translateX(${width - 8}px) translateY(${scrollYVal * (height / contentHeight)}px)`,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 4,
            }}
          />
        )}
      </div>
    )
  }
)

const Track = forwardRef<TrackRef, TrackProps>(function Track(props, ref) {
  const { url, onLoaded, width, height, maxLineWidth, onContentHeightChange } =
    props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoWidthRef = useRef<number>(0)
  const videoHeightRef = useRef<number>(0)
  const imageBlockSegmentsRef = useRef<[number, ImageBlockSegment[]] | []>([])
  const scrollXRef = useRef<number>(0)
  const scrollYRef = useRef<number>(0)
  const currentDrawBeginAt = useRef<number>(0)
  const unitTimeRef = useRef<number>(1000)
  const durationRef = useRef<number>(0)
  const loadedRef = useRef<boolean>(false)

  function blockTime(): number {
    return unitTimeRef.current * blockWidth
  }

  function lineTime(): number {
    return (
      Math.min(maxLineWidth * unitTimeRef.current, durationRef.current) || 0
    )
  }

  function lineCount(): number {
    return Math.ceil(durationRef.current / lineTime()) || 0
  }

  useImperativeHandle(ref, () => ({
    scroll(x: number, y: number) {
      scrollXRef.current = x
      scrollYRef.current = y
      draw()
    },
    setUnitTime(unitTime: number) {
      unitTimeRef.current = unitTime
      onContentHeightChange?.(lineCount() * (lineSpace + blockHeight))
      draw()
    },
    draw,
  }))

  useEffect(() => {
    if (url) {
      init()
    }
  }, [url])

  function init() {
    videoRef.current = document.createElement('video')
    videoRef.current.setAttribute('crossOrigin', 'Anonymous')
    videoRef.current.muted = true
    videoRef.current.src = url
    videoRef.current.onloadeddata = handleVideoLoadeddata
    videoRef.current.preload = 'metadata'

    if (!canvasRef.current) return
    canvasRef.current.width = width * dpi
    canvasRef.current.height = height * dpi
    canvasRef.current.style.width = width + 'px'
    canvasRef.current.style.height = height + 'px'
    const ctx = canvasRef.current.getContext('2d')
    ctx?.scale(dpi, dpi)
  }

  function handleVideoLoadeddata() {
    if (!videoRef.current) return
    const { videoWidth, videoHeight, duration } = videoRef.current

    const durationMS = duration * 1000
    videoWidthRef.current = videoWidth
    videoHeightRef.current = videoHeight
    durationRef.current = durationMS

    onLoaded?.(durationMS)
    loadedRef.current = true
  }

  function calcImgBlocks(): ImageBlockSegment[] {
    const lineTimeVal = lineTime()
    const blockTimeVal = blockTime()

    const lineTailCount = Math.floor(durationRef.current / lineTimeVal)

    let imgBlockSegments = new Array(
      Math.ceil(durationRef.current / blockTimeVal)
    )
      .fill(true)
      .map(
        (_, index, arr) =>
          ({
            id: index,
            startTime: index * blockTimeVal,
            endTime: arr[index + 1]
              ? (index + 1) * blockTimeVal
              : durationRef.current,
          }) as ImageBlockSegment
      )

    for (let i = 0; i < lineTailCount; i++) {
      imgBlockSegments = imgBlockSegments
        .map((seg) => {
          const splitTime = (i + 1) * lineTimeVal

          if (splitTime > seg.startTime && splitTime < seg.endTime) {
            return [
              {
                id: seg.id,
                startTime: seg.startTime,
                isBreakStart: seg.isBreakStart,
                endTime: splitTime,
                isBreakTail: true,
              },
              {
                id: seg.id,
                startTime: splitTime,
                endTime: seg.endTime,
                isBreakStart: true,
              },
            ]
          } else {
            return seg
          }
        })
        .flat()
    }

    return imgBlockSegments
  }

  async function drawBlock(id: number, currentSeg: ImageBlockSegment) {
    if (id < currentDrawBeginAt.current) return
    console.time('before seek')

    const timeAt = currentSeg.startTime
    const videoWidth = videoWidthRef.current
    const videoHeight = videoHeightRef.current
    const blockTimeVal = blockTime()
    const lineTimeVal = lineTime()
    const currentLine = Math.floor(currentSeg.startTime / lineTimeVal)

    if (!canvasRef.current || !videoRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    let source: ImageBitmap

    const exist = frameStore.get(timeAt)
    console.timeEnd('before seek')

    if (!exist) {
      console.time('seek')
      videoRef.current.currentTime = timeAt / 1000
      await new Promise<void>((resolve) => {
        if (!videoRef.current) return
        videoRef.current.onseeked = () => {
          resolve()
        }
      })
      console.timeEnd('seek')
      if (id < currentDrawBeginAt.current) return
      console.time('create imagebitmap')

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
      console.timeEnd('create imagebitmap')
    } else {
      source = exist
    }

    console.time('draw')
    let sourceX = 0
    let sourceY = 0
    let sourceWidth = 0
    let sourceHeight = 0

    if (videoWidth / videoHeight > blockWidth / blockHeight) {
      sourceX = currentSeg.isBreakStart
        ? videoWidth -
          (videoWidth - videoHeight) / 2 -
          videoHeight *
            ((currentSeg.endTime - currentSeg.startTime) / blockTimeVal)
        : (videoWidth - videoHeight) / 2
      sourceY = 0
      sourceWidth =
        videoHeight *
        ((currentSeg.endTime - currentSeg.startTime) / blockTimeVal)
      sourceHeight = videoHeight
    } else {
      sourceX = currentSeg.isBreakStart
        ? videoWidth -
          videoWidth *
            ((currentSeg.endTime - currentSeg.startTime) / blockTimeVal)
        : 0
      sourceY = (videoHeight - videoWidth) / 2
      sourceWidth =
        videoWidth *
        ((currentSeg.endTime - currentSeg.startTime) / blockTimeVal)
      sourceHeight = videoWidth
    }

    const imgX =
      ((currentSeg.startTime - scrollXRef.current * unitTimeRef.current) %
        lineTimeVal) /
      unitTimeRef.current
    const imgY =
      currentLine * (lineSpace + blockHeight) + lineSpace - scrollYRef.current
    const imgWidth =
      (currentSeg.endTime - currentSeg.startTime) / unitTimeRef.current
    const imgHeight = blockHeight

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
    console.timeEnd('draw')
  }

  function drawBackground(id: number, start: number, end: number) {
    if (id < currentDrawBeginAt.current) return
    const lineTimeVal = lineTime()
    const currentLine = Math.floor(start / lineTimeVal)

    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.save()

    const imgX =
      ((start - scrollXRef.current * unitTimeRef.current) % lineTimeVal) /
      unitTimeRef.current
    const imgY =
      currentLine * (lineSpace + blockHeight) + lineSpace - scrollYRef.current
    const imgWidth = (end - start) / unitTimeRef.current
    const imgHeight = blockHeight

    ctx.fillStyle = '#000'
    ctx.fillRect(imgX, imgY, imgWidth, imgHeight)
    ctx.restore()
  }

  async function draw() {
    if (!loadedRef.current) return
    currentDrawBeginAt.current = currentDrawBeginAt.current + 1
    const closureTime = currentDrawBeginAt.current

    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    const lineHeight = lineSpace + blockHeight
    const left =
      (Math.floor(scrollYRef.current / lineHeight) * width +
        scrollXRef.current) *
      unitTimeRef.current

    const right = Math.min(
      (Math.ceil((scrollYRef.current + height) / lineHeight) * width +
        scrollXRef.current) *
        unitTimeRef.current,
      durationRef.current
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

    const imgBlockSegsInView = imageBlockSegments.filter((seg) => {
      return seg.endTime > left && seg.startTime < right
    })

    for (let i = 0; i < imgBlockSegsInView.length; i++) {
      drawBackground(
        closureTime,
        imgBlockSegsInView[i].startTime,
        imgBlockSegsInView[i].endTime
      )
    }

    const rest: ImageBlockSegment[] = []
    // 找出已经有缓存的抽帧图，优先画完
    for (let i = 0; i < imgBlockSegsInView.length; i++) {
      const exist = frameStore.get(imgBlockSegsInView[i].startTime)
      if (exist) {
        await drawBlock(closureTime, imgBlockSegsInView[i])
      } else {
        rest.push(imgBlockSegsInView[i])
      }
    }

    for (let i = 0; i < rest.length; i++) {
      await drawBlock(closureTime, rest[i])
      if (closureTime < currentDrawBeginAt.current) return
    }
  }

  return <canvas ref={canvasRef} />
})
