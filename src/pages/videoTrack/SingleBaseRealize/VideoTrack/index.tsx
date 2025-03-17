import { useEffect, useState, useRef, useMemo } from 'react'
import ScrollBar from './components/ScrollBar'
import Track from './components/Track'

type VideoTrackProps = {
  url: string
  // 容器宽度
  width: number
  // 视频帧高度
  blockHeight: number
  lineSpace: number
  frameDuration: number // 视频帧时长, 单位: ms
  /**
   * 滚动监听函数
   * @param x 横向滚动掉的距离
   * @param y 纵向滚动掉的距离
   * @returns
   */
  onScroll?: (x: number, y: number) => any
}

export default function VideoTrack(props: VideoTrackProps) {
  const { url, width, blockHeight, lineSpace, frameDuration } = props
  const trackRef = useRef<any>()
  const timerRef = useRef<any>()
  const scrollContainerRef = useRef()
  const blockWidthRef = useRef(0)
  const [duration, setDuration] = useState(0)

  function handleFrameDurationChange(val: number) {
    trackRef.current.setFrameDuration(val)
  }
  function handleLoaded(video: HTMLVideoElement) {
    const { videoWidth, videoHeight, duration } = video
    blockWidthRef.current = (videoWidth / videoHeight) * blockHeight
    setDuration(duration * 1000)
  }
  function handleScroll(x: number, y: number) {
    trackRef.current.scroll(x, y)

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      trackRef.current?.scroll?.(x, y + 0.001)
    }, 250)
    props?.onScroll?.(x, y)
  }

  useEffect(() => {
    if (isNaN(frameDuration)) {
      return
    }
    handleFrameDurationChange(frameDuration)
  }, [frameDuration])

  // canvas 内容总宽度 = 帧数 * 每个视频块的占位宽度
  const contentWidth = useMemo(() => {
    return (duration / frameDuration) * blockWidthRef.current
  }, [duration, frameDuration])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <ScrollBar
        ref={scrollContainerRef}
        width={width}
        height={blockHeight + lineSpace}
        contentWidth={contentWidth}
        contentHeight={blockHeight + lineSpace}
        scrollX
        onScroll={handleScroll}
      >
        <Track
          key={'static-track'}
          width={width}
          lineSpace={lineSpace}
          contentWidth={contentWidth}
          blockHeight={blockHeight}
          url={url}
          ref={trackRef}
          onLoaded={handleLoaded}
        />
      </ScrollBar>
    </div>
  )
}
