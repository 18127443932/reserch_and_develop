import { useRef } from 'react'
import { Button } from '@arco-design/web-react'
import { MacScrollbar } from 'mac-scrollbar'
import style from './index.module.less'

const url =
  'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4'
const dpi = window.devicePixelRatio || 1

export default function DrawFrame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  async function handleDraw(timestamp: number) {
    if (!canvasRef.current || !videoRef.current) {
      console.error('canvasRef.current or videoRef.current is null')
      return
    }
    const ctx = canvasRef.current.getContext('2d')
    // 1. 设置视频时间
    videoRef.current.currentTime = timestamp / 1000
    // 2. 等待视频seeked
    await new Promise((resolve) => {
      if (!videoRef.current) return
      videoRef.current.onseeked = resolve
    })
    // 3. 绘制视频帧
    ctx?.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current.clientWidth,
      videoRef.current.clientHeight
    )
  }
  function handleLoadedData() {
    if (!canvasRef.current || !videoRef.current) {
      console.error('canvasRef.current or videoRef.current is null')
      return
    }
    const videoWidth = videoRef.current.clientWidth
    const videoHeight = videoRef.current.clientHeight

    canvasRef.current.width = videoWidth * dpi
    canvasRef.current.height = videoHeight * dpi
    canvasRef.current.style.width = videoWidth + 'px'
    canvasRef.current.style.height = videoHeight + 'px'
    const ctx = canvasRef.current.getContext('2d')
    ctx?.scale(dpi, dpi)
  }
  return (
    <div className={style.container}>
      <h2 className={style.title}>视频帧绘制示例</h2>
      <div className={style.description}>
        <p>基本原理：</p>
        <p>1. 设置视频时间</p>
        <p>2. 等待视频seeked</p>
        <p>3. 绘制视频帧</p>
      </div>
      <div className={style.controls}>
        <span>绘帧：</span>
        {Array.from({ length: 8 }).map((_, index) => (
          <Button key={index} onClick={() => handleDraw(index * 3 * 1000)}>
            {index * 3}s
          </Button>
        ))}
      </div>
      <div className={style.videoContainer}>
        <video
          ref={videoRef}
          src={url}
          muted
          controls
          className={style.video}
          onLoadedData={handleLoadedData}
        />
        <div className={style.canvasContainer}>
          <p>canvas:</p>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  )
}
