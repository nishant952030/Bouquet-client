import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Create from "./pages/Create.jsx";
import Payment from "./pages/Payment.jsx";
import ViewBouquet from "./pages/ViewBouquet.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/creaete" element={<Navigate to="/create" replace />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/view/:id" element={<ViewBouquet />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
