import { Button } from '@arco-design/web-react'
import { Provider } from 'react-redux'
import { useSelector } from 'react-redux'
import A from './childrenComponent/A'
import B from './childrenComponent/B'
import C from './childrenComponent/C'
import style from './index.module.less'
import { store } from './store'
import { RootState } from './store'
import { useRerenderRef } from '../../../utils/hooks/useRerenderRef'

function ReduxDemo() {
  const userInfo = useSelector((state: RootState) => state.userInfo)
  const ref = useRerenderRef()

  return (
    <div className={style.dataDriveUI} ref={ref.updater}>
      <div className={style.title}>数据驱动渲染 - Redux</div>
      <div className={style.userInfo}>
        用户信息
        <div>姓名: {userInfo.name}</div>
        <div>年龄: {userInfo.age}</div>
        <div className={style.operate}>
          <Button
            onClick={() => {
              store.dispatch({
                type: 'SET_USER_INFO',
                payload: { age: userInfo.age + 1 },
              })
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

export function ReduxDemoWrapper() {
  return (
    <Provider store={store}>
      <ReduxDemo />
    </Provider>
  )
}

export default ReduxDemoWrapper
