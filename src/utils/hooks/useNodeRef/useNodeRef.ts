import { useMemo } from 'react'

type RefCallback = (node: HTMLElement | null) => void

export class NodeRef {
  style: React.CSSProperties = {}
  node: HTMLElement | null = null
  #cssText: string = ''

  constructor(style?: React.CSSProperties) {
    if (style) {
      this.setStyle(style)
    }
  }

  /**
   * 更新样式
   * @param style
   */
  setStyle(style: React.CSSProperties): void {
    this.style = style
    this.#cssText = makeStyleToCssText(style)
    if (this.node) {
      this.node.style.cssText = this.#cssText
    }
  }

  /**
   * 绑定节点
   * @param node
   */
  updater: RefCallback = (node: HTMLElement | null) => {
    if (node) {
      this.node = node
      this.node.style.cssText = this.#cssText
    } else {
      this.node = null
    }
  }
}

function makeStyleToCssText(style: React.CSSProperties): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}:${value};`
    })
    .join('')
}

/**
 * 创建用于绑定样式的 NodeRef 对象
 * @param getInitStyle
 */
export function useNodeRef(style?: React.CSSProperties): NodeRef {
  return useMemo(() => new NodeRef(style), [])
}
