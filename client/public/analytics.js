(function() {
  'use strict';

  var ANALYTICS_URL = window.ANALYTICS_URL || 'https://your-analytics-domain.vercel.app';
  var WEBSITE_ID = window.ANALYTICS_WEBSITE_ID;

  if (!WEBSITE_ID) {
    console.warn('[Analytics] Website ID not set. Add: window.ANALYTICS_WEBSITE_ID = "your-id"');
    return;
  }

  function getSessionId() {
    var key = 'ax_sid';
    var sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = generateId();
      sessionStorage.setItem(key, sid);
    }
    return sid;
  }

  function getVisitorId() {
    var key = 'ax_vid';
    var vid = localStorage.getItem(key);
    if (!vid) {
      vid = generateId();
      localStorage.setItem(key, vid);
    }
    return vid;
  }

  function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  function track() {
    var data = {
      websiteId: WEBSITE_ID,
      url: window.location.pathname + window.location.search,
      referrer: document.referrer,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language || navigator.userLanguage,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    var headers = {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId(),
      'X-Visitor-Id': getVisitorId(),
    };

    fetch(ANALYTICS_URL + '/api/track', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(function(err) {
      console.warn('[Analytics] Tracking failed:', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', track);
  } else {
    track();
  }

  if (typeof history !== 'undefined') {
    var originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      setTimeout(track, 100);
    };

    var originalReplaceState = history.replaceState;
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      setTimeout(track, 100);
    };

    window.addEventListener('popstate', function() {
      setTimeout(track, 100);
    });
  }
})();
