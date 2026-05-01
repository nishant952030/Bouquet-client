import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Create from "./pages/Create.jsx";
import Payment from "./pages/Payment.jsx";
import ViewBouquet from "./pages/ViewBouquet.jsx";
import KeywordLanding from "./pages/KeywordLanding.jsx";
import Blog from "./pages/Blog.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import HugCard from "./pages/HugCard.jsx";
import CreateCake from "./pages/CreateCake.jsx";
import ViewCake from "./pages/ViewCake.jsx";
import PaymentCake from "./pages/PaymentCake.jsx";
import useDirection from "./hooks/useDirection.js";

export default function App() {
  useDirection(); // Syncs <html dir> and <html lang> with active language
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-cake" element={<CreateCake />} />
        <Route path="/payment-cake" element={<PaymentCake />} />
        <Route path="/cake/:id" element={<ViewCake />} />
        <Route path="/cake" element={<ViewCake />} />
        <Route path="/hug-card" element={<HugCard />} />
        <Route path="/mothers-day-card" element={<HugCard />} />
        <Route path="/virtual-bouquet-maker" element={<KeywordLanding />} />
        <Route path="/virtual-bouquet-maker-online-free" element={<KeywordLanding />} />
        <Route path="/virtual-bouquet" element={<KeywordLanding />} />
        <Route path="/virtual-bouquet-maker-free" element={<KeywordLanding />} />
        <Route path="/digital-bouquet-maker" element={<KeywordLanding />} />
        <Route path="/digital-bouquet-maker-online-free" element={<KeywordLanding />} />
        <Route path="/digital-flower-bouquet-maker" element={<KeywordLanding />} />
        <Route path="/digital-flower-bouquet" element={<KeywordLanding />} />
        <Route path="/online-bouquet-maker" element={<KeywordLanding />} />
        <Route path="/bouquet-maker" element={<KeywordLanding />} />
        <Route path="/bouquet-maker-online" element={<KeywordLanding />} />
        <Route path="/digital-bouquet-maker-usa" element={<KeywordLanding />} />
        <Route path="/digital-bouquet-maker-uk" element={<KeywordLanding />} />
        <Route path="/digital-bouquet-maker-canada" element={<KeywordLanding />} />
        <Route path="/digital-bouquet-maker-australia" element={<KeywordLanding />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/create" element={<Create />} />
        <Route path="/creaete" element={<Navigate to="/create" replace />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/view/:id/*" element={<ViewBouquet />} />
        <Route path="/view/:id" element={<ViewBouquet />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
