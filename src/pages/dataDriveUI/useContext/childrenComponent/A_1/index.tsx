import style from './index.module.less'
import { useStore } from '../../store'
import { useRerenderRef } from '../../../../../utils/hooks/useRerenderRef'

export function A1() {
  const { userInfo } = useStore()
  const ref = useRerenderRef()

  return (
    <div className={style.container} ref={ref.updater}>
      A 的子组件 A_1
      <div className={style.info}>
        获取到的 userInfo
        <div>name: {userInfo.name}</div>
        <div>age: {userInfo.age}</div>
      </div>
    </div>
  )
}

export default A1
