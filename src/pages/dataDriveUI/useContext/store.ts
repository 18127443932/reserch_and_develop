import { createContext, useContext } from 'react'

interface UserInfo {
  name: string
  age: number
}

interface Store {
  userInfo: UserInfo
  setUserInfo: (info: Partial<UserInfo>) => void
}

export const StoreContext = createContext<Store>({
  userInfo: {
    name: '张三',
    age: 18,
  },
  setUserInfo: () => {},
})

export const useStore = () => useContext(StoreContext)
