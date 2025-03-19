import { Slider } from '@arco-design/web-react'
import VideoTrack from './VideoTrack'
import styles from './index.module.less'
import { useRef, useState } from 'react'
const previewUrl =
  'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4'
export default function SingleBaseRealize() {
  const [frameDuration, setFrameDuration] = useState(1000)
  const videoRef = useRef<HTMLVideoElement>(null)

  function handleScroll(
    x: number,
    y: number,
    contentWidth: number,
    contentHeight: number
  ) {
    if (!videoRef.current) return
    const { duration } = videoRef.current
    const currentTime = duration * (x / contentWidth)
    videoRef.current.currentTime = currentTime
  }

  const handleScaleChange = (value: number | number[]) => {
    if (Array.isArray(value)) return
    setFrameDuration(value)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>视频轨道（虚拟滚动优化）</h1>
      <div className={styles.controls}>
        <div className={styles.sliderGroup}>
          <span className={styles.label}>调整缩放(毫秒/帧):</span>
          <Slider
            defaultValue={1000}
            min={100}
            max={10000}
            step={100}
            onChange={handleScaleChange}
          />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.videoTrackContainer}>
          <video ref={videoRef} src={previewUrl} style={{ width: '800px' }} />
          <VideoTrack
            url={previewUrl}
            width={800}
            frameDuration={frameDuration}
            blockHeight={60}
            lineSpace={20}
            onScroll={handleScroll}
          />
        </div>
      </div>
    </div>
  )
}
