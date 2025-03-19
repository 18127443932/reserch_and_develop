import { useEffect, useState, useRef, useMemo } from 'react'
import ScrollBar from './components/ScrollBar'
import Track from './components/Track'

type VideoTrackProps = {
  /* 视频源 */
  url: string
  /* 容器宽度 */
  width: number
  // 视频帧高度
  blockHeight: number
  /* 文字行高 */
  lineSpace: number
  /* 视频帧时长， 单位: ms */
  frameDuration: number
  /**
   * 滚动监听函数
   * @param x 横向滚动掉的距离
   * @param y 纵向滚动掉的距离
   * @returns
   */
  onScroll?: (
    x: number,
    y: number,
    contentWidth: number,
    contentHeight: number
  ) => any
}

export default function VideoTrack(props: VideoTrackProps) {
  const { url, width, blockHeight, lineSpace, frameDuration } = props
  const trackRef = useRef<any>()
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
    props?.onScroll?.(x, y, contentWidth, contentHeight)
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
  }, [duration, frameDuration, blockWidthRef.current])

  // canvas 内容总高 = 帧提示文本高度 + 帧块高度
  const contentHeight = useMemo(() => {
    return blockHeight + lineSpace
  }, [blockHeight, lineSpace])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <ScrollBar
        ref={scrollContainerRef}
        width={width}
        height={contentHeight}
        contentWidth={contentWidth}
        contentHeight={contentHeight}
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
