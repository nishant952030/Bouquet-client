import { useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";

import Home from "./legacy-pages/Home.jsx";
import Create from "./legacy-pages/Create.jsx";
import Payment from "./legacy-pages/Payment.jsx";
import ViewBouquet from "./legacy-pages/ViewBouquet.jsx";
import KeywordLanding from "./legacy-pages/KeywordLanding.jsx";
import CreateShagun from "./legacy-pages/CreateShagun.jsx";
import ShagunSuccess from "./legacy-pages/ShagunSuccess.jsx";
import ClaimShagun from "./legacy-pages/ClaimShagun.jsx";
import Blog from "./legacy-pages/Blog.jsx";
import BlogPost from "./legacy-pages/BlogPost.jsx";
import HugCard from "./legacy-pages/HugCard.jsx";
import CreateHugCard from "./legacy-pages/CreateHugCard.jsx";
import GreetingCard from "./legacy-pages/GreetingCard.jsx";
import CreateGreetingCard from "./legacy-pages/CreateGreetingCard.jsx";
import PaymentGreetingCard from "./legacy-pages/PaymentGreetingCard.jsx";
import MothersDayKeywordLanding from "./legacy-pages/MothersDayKeywordLanding.jsx";
import AdminDashboard from "./legacy-pages/AdminDashboard.jsx";
import Cart from "./legacy-pages/Cart.jsx";
import GiftBundle from "./legacy-pages/GiftBundle.jsx";

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
        <Route path="/ph" element={<Navigate to="/" replace />} />
        <Route path="/philippines" element={<Navigate to="/" replace />} />
        <Route path="/shagun" element={<CreateShagun />} />
        <Route path="/shagun/success/:id" element={<ShagunSuccess />} />
        <Route path="/claim/:id" element={<ClaimShagun />} />

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
