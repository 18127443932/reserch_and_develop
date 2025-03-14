import { Button } from '@arco-design/web-react'
import { useState } from 'react'
import A from './childrenComponent/A'
import B from './childrenComponent/B'
import C from './childrenComponent/C'
import style from './index.module.less'
import { StoreContext } from './store'
import { useRerenderRef } from '../../../utils/hooks/useRerenderRef'

export function UseContextDemo() {
  const [userInfo, setUserInfo] = useState({
    name: '张三',
    age: 18,
  })
  const ref = useRerenderRef()

  return (
    <StoreContext.Provider
      value={{
        userInfo,
        setUserInfo: (info) => {
          setUserInfo((prev) => ({ ...prev, ...info }))
        },
      }}
    >
      <div className={style.dataDriveUI} ref={ref.updater}>
        <div className={style.title}>数据驱动渲染 - Context</div>
        <div className={style.userInfo}>
          用户信息
          <div>姓名: {userInfo.name}</div>
          <div>年龄: {userInfo.age}</div>
          <div className={style.operate}>
            <Button
              onClick={() => {
                setUserInfo((prev) => ({ ...prev, age: prev.age + 1 }))
              }}
            >
              age+1
            </Button>
          </div>
        </div>
        <A />
        <B />
        <C />
      </div>
    </StoreContext.Provider>
  )
}

export default UseContextDemo
