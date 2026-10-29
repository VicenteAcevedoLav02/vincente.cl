import { Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "./pages/HomePage.tsx"
import { ResumePage } from "./pages/ResumePage.tsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/resume" element={<ResumePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
