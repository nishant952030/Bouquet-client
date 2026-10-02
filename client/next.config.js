/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
    VITE_GROQ_API_KEY: process.env.VITE_GROQ_API_KEY,
    VITE_GROQ_MODEL: process.env.VITE_GROQ_MODEL,
    VITE_GROQ_API_URL: process.env.VITE_GROQ_API_URL,
    VITE_RAZORPAY_KEY_ID: process.env.VITE_RAZORPAY_KEY_ID,
    VITE_PAYPAL_CLIENT_ID: process.env.VITE_PAYPAL_CLIENT_ID,
    VITE_ANALYTICS_API_URL: process.env.VITE_ANALYTICS_API_URL,
    VITE_GA_MEASUREMENT_ID: process.env.VITE_GA_MEASUREMENT_ID,
    VITE_ANALYTICS_WEBSITE_ID: process.env.VITE_ANALYTICS_WEBSITE_ID,
    VITE_SUPPORT_EMAIL: process.env.VITE_SUPPORT_EMAIL,
    VITE_ADMIN_KEY: process.env.VITE_ADMIN_KEY,
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
    VITE_GROK_PROXY_URL: process.env.VITE_GROK_PROXY_URL,
    VITE_GROK_API_URL: process.env.VITE_GROK_API_URL,
    VITE_GROK_MODEL: process.env.VITE_GROK_MODEL,
    VITE_GROK_API_KEY: process.env.VITE_GROK_API_KEY,
  },
  async redirects() {
    return [
      // 1. Bouquet-Maker Cluster Consolidation -> /virtual-bouquet-maker
      { source: "/virtual-bouquet-maker-online-free", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/virtual-bouquet", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/virtual-bouquet-maker-free", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/digital-bouquet-maker", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/digital-bouquet-maker-online-free", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/digital-flower-bouquet-maker", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/digital-flower-bouquet", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/online-bouquet-maker", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/bouquet-maker", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/bouquet-maker-online", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/digital-bouquet-maker-usa", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/digital-bouquet-maker-uk", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/digital-bouquet-maker-canada", destination: "/virtual-bouquet-maker", permanent: true },
      { source: "/digital-bouquet-maker-australia", destination: "/virtual-bouquet-maker", permanent: true },

      // 2. Generic Mother's Day aliases -> Evergreen Pages
      { source: "/mothers-day-card", destination: "/create-greeting-card", permanent: true },
      { source: "/mothers-day", destination: "/create-greeting-card", permanent: true },
    ];
  },
};

export default nextConfig;
