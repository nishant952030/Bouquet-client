// analytics.js

const TRACKER_URL = 'https://site-tracker-ruddy.vercel.app';
const WEBSITE_ID = 'petalsandwords';

// ✅ INIT GA
export function initGoogleAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (typeof window === "undefined" || !measurementId) return;
  if (window.__gaInitialized) return;

  // Load GA script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;

  gtag("js", new Date());

  // ❗ IMPORTANT: disable auto page view
  gtag("config", measurementId, {
    send_page_view: false,
  });

  window.__gaInitialized = true;
}

// ✅ PAGE VIEW TRACKING (VERY IMPORTANT)
export function trackPageView(url) {
  if (typeof window === "undefined") return;

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: url,
    });
  }

  sendToTracker({
    type: 'pageview',
  });
}

// ✅ EVENT TRACKING
export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  sendToTracker({
    type: 'event',
    name: eventName,
    params,
  });
}

// ✅ CUSTOM TRACKER
function sendToTracker(data) {
  try {
    const sessionId = getSessionId();
    const visitorId = getVisitorId();

    fetch(`${TRACKER_URL}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId,
        'X-Visitor-Id': visitorId,
      },
      body: JSON.stringify({
        websiteId: WEBSITE_ID,
        url: window.location.pathname + window.location.search,
        referrer: document.referrer,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        ...data,
      }),
      keepalive: true,
    }).catch((err) => {
      console.debug("Tracker error:", err);
    });

  } catch (err) {
    console.debug("Tracker crash:", err);
  }
}

// ✅ SESSION ID
function getSessionId() {
  const key = 'ax_sid';
  let sid = sessionStorage.getItem(key);

  if (!sid) {
    sid = generateId();
    sessionStorage.setItem(key, sid);
  }

  return sid;
}

// ✅ VISITOR ID
function getVisitorId() {
  const key = 'ax_vid';
  let vid = localStorage.getItem(key);

  if (!vid) {
    vid = generateId();
    localStorage.setItem(key, vid);
  }

  return vid;
}

// ✅ BETTER ID
function generateId() {
  return crypto.randomUUID();
}