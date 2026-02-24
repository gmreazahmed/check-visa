import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CheckVisa from "./pages/CheckVisa";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route path="/" element={<CheckVisa />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Catch-all (Wrong URL Redirect) */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;