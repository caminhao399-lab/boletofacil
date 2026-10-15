(() => {
  const CONSENT_KEY = 'boletofacil_google_consent_v1';
  const banner = document.querySelector('#consent-notice');
  let choice = null;
  try { choice = localStorage.getItem(CONSENT_KEY); } catch (_) {}

  let analyticsConfigured = false;
  let adsConfigured = false;
  let gtagScriptAdded = false;

  function applyGoogleConsent(value) {
    const allowAnalytics = value === 'analytics' || value === 'all';
    const allowAds = value === 'all';
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: allowAnalytics ? 'granted' : 'denied',
        ad_storage: allowAds ? 'granted' : 'denied',
        ad_user_data: allowAds ? 'granted' : 'denied',
        ad_personalization: allowAds ? 'granted' : 'denied'
      });
    }
    if (!allowAnalytics && !allowAds) {
      window.googleTagsActive = false;
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', {
      analytics_storage: allowAnalytics ? 'granted' : 'denied',
      ad_storage: allowAds ? 'granted' : 'denied',
      ad_user_data: allowAds ? 'granted' : 'denied',
      ad_personalization: allowAds ? 'granted' : 'denied'
    });
    window.googleTagsActive = true;
    window.gtag('js', new Date());

    if (!analyticsConfigured && allowAnalytics) {
      window.gtag('config', 'G-S33R4WG5FG');
      analyticsConfigured = true;
    }
    if (!adsConfigured && allowAds) {
      window.gtag('config', 'AW-18446058147');
      adsConfigured = true;
    }
    if (!gtagScriptAdded) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-S33R4WG5FG';
      script.setAttribute('data-consent-dependent', 'google-tags');
      document.head.appendChild(script);
      gtagScriptAdded = true;
    }
  }

  function saveChoice(value) {
    choice = value;
    try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
    if (banner) banner.hidden = true;
    applyGoogleConsent(value);
  }

  if (banner) {
    banner.hidden = Boolean(choice);
    document.querySelector('#consent-accept-all')?.addEventListener('click', () => saveChoice('all'));
    document.querySelector('#consent-analytics')?.addEventListener('click', () => saveChoice('analytics'));
    document.querySelector('#consent-reject')?.addEventListener('click', () => saveChoice('denied'));
  }

  document.querySelector('#cookie-settings')?.addEventListener('click', () => {
    if (!banner) return;
    banner.hidden = false;
    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelector('#consent-accept-all')?.focus({ preventScroll: true });
  });

  if (choice) applyGoogleConsent(choice);

  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      if (window.googleTagsActive && typeof window.gtag === 'function') {
        window.gtag('event', 'whatsapp_click', {
          event_category: 'contact',
          event_label: link.textContent.trim().replace(/\s+/g, ' ')
        });
      }
    });
  });
})();
