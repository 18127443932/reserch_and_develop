import { Slider } from '@arco-design/web-react'
import VideoTrack from './VideoTrack'
import styles from './index.module.less'
import { useState } from 'react'
const previewUrl =
  'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4'
export default function SingleBaseRealize() {
  const videoTrackHeight = 80
  const [frameDuration, setFrameDuration] = useState(1000)

  function handleScroll(x: number, y: number) {
    // console.log('x, y: ', { x, y })
  }

  const handleScaleChange = (value: number | number[]) => {
    if (Array.isArray(value)) return
    setFrameDuration(value)
  }

  return (
    <div>
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
      <VideoTrack
        url={previewUrl}
        width={1060}
        frameDuration={frameDuration}
        blockHeight={videoTrackHeight}
        lineSpace={0}
        onScroll={handleScroll}
      />
    </div>
  )
}
