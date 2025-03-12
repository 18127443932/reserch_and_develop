import style from './App.module.less'
import { MacScrollbar } from 'mac-scrollbar'
import SideBar from './components/SideBar'
import '@arco-design/web-react/dist/css/arco.css'
import 'mac-scrollbar/dist/mac-scrollbar.css'

import Content from './routers'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <div className={style.main}>
              <SideBar />
              <MacScrollbar className={style.content}>
                <Content />
              </MacScrollbar>
            </div>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
