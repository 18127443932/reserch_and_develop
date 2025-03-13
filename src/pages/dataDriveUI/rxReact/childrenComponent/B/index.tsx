import style from './index.module.less'
import B1 from '../B_1'
import { useRerenderRef } from '../../../../../utils/hooks/useRerenderRef'

export default function B() {
  const ref = useRerenderRef()
  return (
    <div className={style.container} ref={ref.updater}>
      子组件 B
      <B1 />
    </div>
  )
}
