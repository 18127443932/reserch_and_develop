import { Button } from '@arco-design/web-react'
import A from './childrenComponent/A'
import B from './childrenComponent/B'
import C from './childrenComponent/C'
import style from './index.module.less'
import { model } from './store'
import useSubject from 'utils/hooks/useSubject'
import { useRerenderRef } from 'utils/hooks/useRerenderRef'

export default function DataDriveUI() {
  const ref = useRerenderRef()
  // 未订阅
  // const name = model.userInfo.name.getLast()
  // const age = model.userInfo.age.getLast()
  // 订阅
  const name = useSubject(model.userInfo.name)
  const age = useSubject(model.userInfo.age)
  return (
    <div className={style.dataDriveUI} ref={ref.updater}>
      <div className={style.title}>数据驱动渲染 - rx </div>
      <div className={style.userInfo}>
        用户信息
        <div>姓名: {name}</div>
        <div>年龄: {age}</div>
        <div className={style.operate}>
          <Button
            onClick={() => {
              model.userInfo.addAge()
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
  )
}
