import style from './index.module.less'
import { model } from '../../store'
import { Button } from '@arco-design/web-react'
import useSubject from '../../../../../utils/hooks/useSubject'
import { useRerenderRef } from 'utils/hooks/useRerenderRef'

export default function B1() {
  const ref = useRerenderRef()
  const name = useSubject(model.userInfo.name)
  const age = useSubject(model.userInfo.age)
  return (
    <div className={style.container} ref={ref.updater}>
      B 的子组件 B_1
      <div>
        获取到的 userInfo
        <div>name: {name}</div>
        <div>age: {age}</div>
        <Button
          onClick={() => {
            model.userInfo.age.value = 18
          }}
        >
          设置 age 为 18
        </Button>
        <Button
          onClick={() => {
            console.log(
              'model.userInfo.age.getHistory()',
              model.userInfo.age.getHistory()
            )
          }}
        >
          打印 age 堆栈
        </Button>
      </div>
    </div>
  )
}
