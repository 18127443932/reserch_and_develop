import { Routes, Route } from 'react-router-dom'
import DataDriveUI from '../pages/dataDriveUI'
import VideoTrack from '../pages/videoTrack'

const rootPath = ''

export default function Content() {
  return (
    <Routes>
      <Route path="*" element={<DataDriveUI />} />
      <Route path={`${rootPath}/data_drive_ui`} element={<DataDriveUI />} />
      <Route path={`${rootPath}/video_track`} element={<VideoTrack />} />
    </Routes>
  )
}
