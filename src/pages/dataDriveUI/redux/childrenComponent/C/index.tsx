import style from './index.module.less'
import { useRerenderRef } from '../../../../../utils/hooks/useRerenderRef'

export function C() {
  const ref = useRerenderRef()
  return (
    <div className={style.container} ref={ref.updater}>
      C 组件, 不依赖 store
    </div>
  )
}

export default C 