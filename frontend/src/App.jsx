import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WBS from "./pages/WBS"; // ⬅ import halaman baru

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/WBS" element={<WBS />} />
      </Routes>
    </Router>
  );
}
