import { Routes, Route } from 'react-router-dom'

import DataDriveUIRedux from '../pages/dataDriveUI/Redux'
import DataDriveUIUseContext from '../pages/dataDriveUI/UseContext'
import DataDriveUIRxReact from '../pages/dataDriveUI/RxReact'
import VideoTrack from '../pages/videoTrack'

const rootPath = ''

export default function Content() {
  return (
    <Routes>
      <Route
        path={`${rootPath}/data_drive_ui`}
        element={<DataDriveUIRxReact />}
      />
      <Route
        path={`${rootPath}/data_drive_ui/useContext`}
        element={<DataDriveUIUseContext />}
      />
      <Route
        path={`${rootPath}/data_drive_ui/redux`}
        element={<DataDriveUIRedux />}
      />
      <Route
        path={`${rootPath}/data_drive_ui/rx+react`}
        element={<DataDriveUIRxReact />}
      />
      <Route path={`${rootPath}/video_track`} element={<VideoTrack />} />
    </Routes>
  )
}
