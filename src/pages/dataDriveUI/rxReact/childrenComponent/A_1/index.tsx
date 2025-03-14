import style from './index.module.less'
import { model } from '../../store'
import useSubject from '../../../../../utils/hooks/useSubject'
import { useRerenderRef } from '../../../../../utils/hooks/useRerenderRef'

export function A1() {
  const ref = useRerenderRef()
  const name = useSubject(model.userInfo.name)
  const age = useSubject(model.userInfo.age)
  return (
    <div className={style.container} ref={ref.updater}>
      A 的子组件 A_1
      <div>
        获取到的 userInfo
        <div>name: {name}</div>
        <div>age: {age}</div>
      </div>
    </div>
  )
}

export default A1
