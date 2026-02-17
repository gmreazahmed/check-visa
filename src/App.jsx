import { BrowserRouter, Routes, Route } from "react-router-dom";
import CheckVisa from "./pages/CheckVisa";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CheckVisa />} />
        <Route path="/admin" element={<AdminPanel/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
