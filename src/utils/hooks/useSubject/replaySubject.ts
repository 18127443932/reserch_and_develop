import { Subject } from 'rxjs'

export class ReplaySubject<T> extends Subject<T> {
  /**
   * 历史数据
   */
  #events: T[] = []
  /**
   * 缓存大小
   */
  #cacheSize: number = 1

  /**
   * 构造函数
   * @param cacheSize 缓存大小
   * @param initVal 初始数据
   */
  constructor(cacheSize: number = 1, initVal?: T) {
    super()
    this.#cacheSize = cacheSize
    if (initVal) {
      this.next(initVal)
    }
  }

  /**
   * 创建一个 ReplaySubject 实例
   * @param v 初始数据
   * @returns ReplaySubject 实例
   */
  static create<V>(v: V): ReplaySubject<V> {
    return new ReplaySubject(1, v)
  }

  /**
   *
   * @param value 新数据
   * @returns
   */
  next(value: T): Subject<T> {
    this.#events.push(value)
    // 如果events数组的长度大于cacheSize，则删除第一个元素（LRU）
    if (this.#events.length > this.#cacheSize) {
      this.#events.shift()
    }
    super.next(value)
    return this
  }

  /**
   * @deprecated
   * @param val
   * 建议使用显式的 next 替代
   */
  set value(val: T) {
    this.next(val)
  }

  /**
   * 获取最新（最后）数据
   * @returns
   */
  getLast(): T {
    return this.#events[this.#events.length - 1]
  }

  /**
   * 获取历史数据
   * @returns 历史数据
   */
  getHistory(): T[] {
    return this.#events
  }
}
