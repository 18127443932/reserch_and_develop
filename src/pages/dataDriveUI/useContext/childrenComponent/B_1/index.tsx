import { Button } from '@arco-design/web-react'
import style from './index.module.less'
import { useStore } from '../../store'
import { useRerenderRef } from '../../../../../utils/hooks/useRerenderRef'

export function B1() {
  const { userInfo, setUserInfo } = useStore()
  const ref = useRerenderRef()

  return (
    <div className={style.container} ref={ref.updater}>
      B 的子组件 B_1
      <div className={style.info}>
        获取到的 userInfo
        <div>name: {userInfo.name}</div>
        <div>age: {userInfo.age}</div>
        <Button
          onClick={() => {
            setUserInfo({ age: 18 })
          }}
        >
          age = 18
        </Button>
      </div>
    </div>
  )
}

export default B1
