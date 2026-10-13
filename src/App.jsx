
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CheckVisa from "./pages/CheckVisa";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public visa verification page */}
        <Route path="/" element={<CheckVisa />} />

        {/* Separate admin login page */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Redirect unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

