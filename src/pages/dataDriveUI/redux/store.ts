import { createStore } from 'redux'

interface UserInfo {
  name: string
  age: number
}

interface State {
  userInfo: UserInfo
}

interface Action {
  type: 'SET_USER_INFO'
  payload: Partial<UserInfo>
}

const initialState: State = {
  userInfo: {
    name: '张三',
    age: 18,
  },
}

const reducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case 'SET_USER_INFO':
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          ...action.payload,
        },
      }
    default:
      return state
  }
}

export const store = createStore(reducer)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
