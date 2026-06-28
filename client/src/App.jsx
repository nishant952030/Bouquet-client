import { useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Create from "./pages/Create.jsx";
import Payment from "./pages/Payment.jsx";
import ViewBouquet from "./pages/ViewBouquet.jsx";
import KeywordLanding from "./pages/KeywordLanding.jsx";
import CakeKeywordLanding from "./pages/CakeKeywordLanding.jsx";
import Blog from "./pages/Blog.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import HugCard from "./pages/HugCard.jsx";
import CreateHugCard from "./pages/CreateHugCard.jsx";
import GreetingCard from "./pages/GreetingCard.jsx";
import CreateGreetingCard from "./pages/CreateGreetingCard.jsx";
import PaymentGreetingCard from "./pages/PaymentGreetingCard.jsx";
import MothersDayKeywordLanding from "./pages/MothersDayKeywordLanding.jsx";
import CreateCake from "./pages/CreateCake.jsx";
import ViewCake from "./pages/ViewCake.jsx";
import PaymentCake from "./pages/PaymentCake.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Cart from "./pages/Cart.jsx";
import GiftBundle from "./pages/GiftBundle.jsx";
import CreatePlushie from "./pages/CreatePlushie.jsx";
import PaymentPlushie from "./pages/PaymentPlushie.jsx";
import ViewPlushie from "./pages/ViewPlushie.jsx";

import CreateShagun from "./pages/CreateShagun.jsx";
import ShagunSuccess from "./pages/ShagunSuccess.jsx";
import ClaimShagun from "./pages/ClaimShagun.jsx";

import useDirection from "./hooks/useDirection.js";

// ✅ IMPORT ANALYTICS
import { initGoogleAnalytics, trackPageView } from "./lib/analytics.js";
import { trackPageViewFirestore } from "./lib/tracker.js";

import FeedbackWidget from "./components/FeedbackWidget.jsx";
import FloatingCart from "./components/FloatingCart.jsx";

// ✅ PAGE TRACKER
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
    trackPageViewFirestore(location.pathname + location.search);
  }, [location]);

  return null;
}

export default function App() {
  useDirection();

  // ✅ INIT GA ONCE
  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <PageTracker />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shagun" element={<CreateShagun />} />
        <Route path="/shagun/success/:id" element={<ShagunSuccess />} />
        <Route path="/claim/:id" element={<ClaimShagun />} />
        <Route path="/create-cake" element={<CreateCake />} />
        <Route path="/payment-cake" element={<PaymentCake />} />
        <Route path="/cake/:id" element={<ViewCake />} />
        <Route path="/cake" element={<ViewCake />} />

        <Route path="/create-plushie" element={<CreatePlushie />} />
        <Route path="/payment-plushie" element={<PaymentPlushie />} />
        <Route path="/plushie/:id" element={<ViewPlushie />} />
        <Route path="/plushie" element={<ViewPlushie />} />

        {/* Localized Cake SEO Routes */}
        <Route path="/tl/virtual-cake-anniversary" element={<CakeKeywordLanding />} />
        <Route path="/es/pastel-de-cumpleanos-virtual" element={<CakeKeywordLanding />} />
        <Route path="/bn/virtual-janmadin-cake" element={<CakeKeywordLanding />} />

        {/* Localized Mother's Day SEO Routes */}
        <Route path="/free-digital-mothers-day-card" element={<MothersDayKeywordLanding />} />
        <Route path="/best-virtual-mothers-day-card" element={<MothersDayKeywordLanding />} />
        <Route path="/send-virtual-hug-mothers-day" element={<MothersDayKeywordLanding />} />
        <Route path="/mothers-day-digital-gift" element={<MothersDayKeywordLanding />} />
        <Route path="/interactive-mothers-day-card" element={<MothersDayKeywordLanding />} />

        <Route path="/hug-card" element={<HugCard />} />
        <Route path="/create-hug-card" element={<CreateHugCard />} />
        <Route path="/create-greeting-card" element={<CreateGreetingCard />} />
        <Route path="/create-mothers-day-card" element={<CreateGreetingCard />} />
        <Route path="/payment-greeting-card" element={<PaymentGreetingCard />} />
        <Route path="/payment-card-md" element={<PaymentGreetingCard />} />
        <Route path="/greeting-card" element={<GreetingCard />} />
        <Route path="/mothers-day-card" element={<GreetingCard />} />
        <Route path="/mothers-day" element={<GreetingCard />} />

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
        <Route path="/cart" element={<Cart />} />
        <Route path="/gift/:id" element={<GiftBundle />} />

        <Route path="/view/:id/*" element={<ViewBouquet />} />
        <Route path="/view/:id" element={<ViewBouquet />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <FloatingCart />
      <FeedbackWidget />
    </BrowserRouter>
  );
}
