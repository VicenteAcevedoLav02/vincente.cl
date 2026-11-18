import { Navigate, Route, Routes } from "react-router-dom"
import { ChannelTransition } from "./components/ChannelTransition.tsx"
import { HomePage } from "./pages/HomePage.tsx"
import { ResumePage } from "./pages/ResumePage.tsx"
import { SpeedokuPage } from "./pages/SpeedokuPage.tsx"
import { VisitalasPage } from "./pages/VisitalasPage.tsx"

export default function App() {
  return (
    <ChannelTransition>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/visitalas" element={<VisitalasPage />} />
        <Route path="/speedoku" element={<SpeedokuPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ChannelTransition>
  )
}
