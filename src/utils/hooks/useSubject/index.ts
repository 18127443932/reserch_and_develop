import { useState, useEffect } from 'react'
import { ReplaySubject } from './replaySubject'

// 定义一个泛型函数useSubject，接收一个参数subject
function useSubject<T>(subject: ReplaySubject<T>): T {
  const [value, setValue] = useState<T>(subject.getLast())
  useEffect(() => {
    const subscription = subject.subscribe((val) => {
      setValue(val)
    })
    return () => {
      subscription.unsubscribe()
    }
  })
  return value
}

export default useSubject
