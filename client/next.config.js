/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
    NEXT_PUBLIC_ADMIN_KEY: process.env.NEXT_PUBLIC_ADMIN_KEY || process.env.VITE_ADMIN_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_ANALYTICS_API_URL: process.env.NEXT_PUBLIC_ANALYTICS_API_URL || process.env.VITE_ANALYTICS_API_URL,
    NEXT_PUBLIC_ANALYTICS_WEBSITE_ID: process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID || process.env.VITE_ANALYTICS_WEBSITE_ID,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    NEXT_PUBLIC_GROQ_API_KEY: process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY,
    NEXT_PUBLIC_GROQ_MODEL: process.env.NEXT_PUBLIC_GROQ_MODEL || process.env.VITE_GROQ_MODEL,
    NEXT_PUBLIC_GROQ_API_URL: process.env.NEXT_PUBLIC_GROQ_API_URL || process.env.VITE_GROQ_API_URL,
    VITE_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
    VITE_ADMIN_KEY: process.env.NEXT_PUBLIC_ADMIN_KEY || process.env.VITE_ADMIN_KEY,
    VITE_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID,
    VITE_ANALYTICS_API_URL: process.env.NEXT_PUBLIC_ANALYTICS_API_URL || process.env.VITE_ANALYTICS_API_URL,
    VITE_ANALYTICS_WEBSITE_ID: process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID || process.env.VITE_ANALYTICS_WEBSITE_ID,
    VITE_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
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
