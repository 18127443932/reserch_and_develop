import { useEffect, useState, useRef, forwardRef } from 'react'
import styles from './index.module.less'

type ScrollBarProps = {
  style?: React.CSSProperties
  contentWidth: number
  contentHeight: number
  onScroll: (nextScrollX: number, nextScrollY: number) => any
  scrollX?: boolean
  scrollY?: boolean
  width: number
  height: number
  disabled?: boolean
  children?: JSX.Element
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ScrollBar = forwardRef(function (props: ScrollBarProps, ref) {
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
    containerRef.current?.addEventListener('wheel', handleWheel)
    return () => {
      containerRef.current?.removeEventListener('wheel', handleWheel)
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
        } else if (lastContetWidthRef.current !== contentWidth) {
          const lastScrollRatio = scrollXVal / lastContetWidthRef.current
          const viewRatio = Math.min(width / contentWidth, 1)
          // 滚动比例不能大于1 - viewRatio
          nextScrollXVal =
            Math.min(1 - viewRatio, lastScrollRatio) * contentWidth
          setScrollXVal(nextScrollXVal)
          lastContetWidthRef.current = contentWidth
        }
      }
      if (scrollY) {
        if (!lastContetHeightRef.current) {
          lastContetHeightRef.current = contentHeight
        } else if (lastContetHeightRef.current !== contentHeight) {
          const lastScrollRatio = scrollYVal / lastContetHeightRef.current
          const viewRatio = Math.min(height / contentHeight, 1)
          // 滚动比例不能大于1 - viewRatio
          nextScrollYVal =
            Math.min(1 - viewRatio, lastScrollRatio) * contentHeight
          setScrollYVal(nextScrollYVal)
          lastContetHeightRef.current = contentHeight
        }
      }
      ;(nextScrollXVal !== scrollXVal || nextScrollYVal !== scrollYVal) &&
        onScroll?.(nextScrollXVal, nextScrollYVal)
    }
  }, [contentWidth, contentHeight])

  useEffect(() => {
    if (contentWidth && contentHeight) {
      lastContetWidthRef.current = contentWidth
      lastContetHeightRef.current = contentHeight
      setScrollXVal(0)
      onScroll?.(0, scrollYVal)
    }
  }, [contentWidth, contentHeight])

  function handleWheel(e: any) {
    if (disabled) {
      return
    }
    e.stopPropagation()
    e.preventDefault()
    const { deltaX, deltaY } = e as Record<string, number>
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

  return (
    <div
      className={styles.container}
      ref={containerRef}
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
            width: (width / contentWidth) * width,
            transform: `translateX(${scrollXVal * (width / contentWidth)}px)`,
          }}
        ></div>
      )}
      {!disabled && scrollY && contentHeight > height && (
        <div
          className={styles.scrollBarY}
          style={{
            height: (height / contentHeight) * height,
            transform: `translateX(${width - 8}px) translateY(${
              scrollYVal * (height / contentHeight)
            }px)`,
          }}
        ></div>
      )}
    </div>
  )
})

ScrollBar.displayName = 'ScrollBar'
export default ScrollBar
