import { Routes, Route } from 'react-router-dom'

import DataDriveUIRedux from '../pages/dataDriveUI/Redux'
import DataDriveUIUseContext from '../pages/dataDriveUI/UseContext'
import DataDriveUIRxReact from '../pages/dataDriveUI/RxReact'
import VideoTrack from '../pages/videoTrack'
import VideoTrackDrawFrame from '../pages/videoTrack/DrawFrame'
import VideoTrackBaseRealize from '../pages/videoTrack/BaseRealize'

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
        path={`${rootPath}/data_drive_ui/rx_react`}
        element={<DataDriveUIRxReact />}
      />
      <Route path={`${rootPath}/video_track`} element={<VideoTrack />} />
      <Route
        path={`${rootPath}/video_track/draw_frame`}
        element={<VideoTrackDrawFrame />}
      />
      <Route
        path={`${rootPath}/video_track/base_realize`}
        element={<VideoTrackBaseRealize />}
      />
    </Routes>
  )
}
