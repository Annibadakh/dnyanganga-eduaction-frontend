import ChapterManager from "./ChapterManager"
import { Route, Routes } from "react-router"

const index = () => {
  return (
    <Routes>
        <Route path="/" element={<ChapterManager />} />
    </Routes>
  )
}

export default index