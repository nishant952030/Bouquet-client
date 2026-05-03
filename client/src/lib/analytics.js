const TRACKER_URL = 'https://site-tracker-ruddy.vercel.app';
const WEBSITE_ID = 'petalsandwords';

export function initGoogleAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (typeof window === "undefined" || !measurementId) {
    return;
  }

  if (window.__gaInitialized) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  gtag("js", new Date());
  gtag("config", measurementId, { send_page_view: true });
  window.gtag = gtag;
  window.__gaInitialized = true;
}

export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  sendToTracker({
    type: 'event',
    name: eventName,
    params,
  });
}

function sendToTracker(data) {
  if (typeof window === "undefined") return;
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
        language: navigator.language || navigator.userLanguage,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...data,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

function getSessionId() {
  const key = 'ax_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = generateId();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

function getVisitorId() {
  const key = 'ax_vid';
  let vid = localStorage.getItem(key);
  if (!vid) {
    vid = generateId();
    localStorage.setItem(key, vid);
  }
  return vid;
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
