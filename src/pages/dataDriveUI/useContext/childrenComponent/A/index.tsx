import style from './index.module.less'
import A1 from '../A_1'
import { useRerenderRef } from '../../../../../utils/hooks/useRerenderRef'

export function A() {
  const ref = useRerenderRef()
  return (
    <div className={style.main} ref={ref.updater}>
      子组件A
      <A1 />
    </div>
  )
}

export default A
