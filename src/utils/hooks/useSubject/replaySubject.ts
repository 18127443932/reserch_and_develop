import { Subject } from 'rxjs'

export class ReplaySubject<T> extends Subject<T> {
  #events: T[] = []
  #cacheSize: number = 1

  constructor(cacheSize: number = 1, initVal?: T) {
    super()
    this.#cacheSize = cacheSize
    if (initVal) {
      this.next(initVal)
    }
  }

  static create<V>(v: V): ReplaySubject<V> {
    return new ReplaySubject(1, v)
  }

  /**
   *
   * @param value 发送的数据
   * @returns
   */
  next(value: T): Subject<T> {
    this.#events.push(value)
    // 如果events数组的长度大于cacheSize，则删除第一个元素
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

  getLast(): T {
    return this.#events[this.#events.length - 1]
  }

  getHistory(): T[] {
    return this.#events
  }
}
