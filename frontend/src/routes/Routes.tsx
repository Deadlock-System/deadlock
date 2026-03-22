import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "../pages/Register/Register";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}