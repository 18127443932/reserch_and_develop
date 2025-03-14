import { useMemo } from 'react'
import { NodeRef } from '../useNodeRef/useNodeRef'

/**
 * 创建一个 NodeRef 对象，用于在 render 时闪烁背景
 * @param startStyle // 开始的样式
 * @param endStyle // 结束的样式
 * @param duration // 持续时间
 * @returns
 */
export function useRerenderRef(
  startStyle: React.CSSProperties = { background: 'pink' },
  endStyle: React.CSSProperties = {},
  duration: number = 100
): NodeRef {
  const nodeRef = useMemo(() => new NodeRef(), [])
  nodeRef.setStyle(startStyle)
  setTimeout(() => {
    nodeRef.setStyle(endStyle)
  }, duration)
  return nodeRef
}
