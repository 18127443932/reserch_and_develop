import { ReplaySubject } from '../../../utils/hooks/useSubject/replaySubject'

type UserInfo = {
  name: ReplaySubject<string>
  age: ReplaySubject<number>
  addAge: () => void
}

class Model {
  userInfo: UserInfo = {
    name: ReplaySubject.create('张三'),
    age: new ReplaySubject(10, 18),

    addAge: () => {
      const age = this.userInfo.age.getLast()
      this.userInfo.age.next(age + 1)
    },
  }
}

export const model = new Model()
