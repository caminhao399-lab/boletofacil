(() => {
  const CONSENT_KEY = 'boletofacil_google_consent_v3';
  const GOOGLE_TAG_ID = 'G-G24QSMX7JK';
  const GTM_ID = 'GTM-MF2H48XN';
  const banner = document.querySelector('#consent-notice');
  const validChoices = new Set(['all', 'analytics', 'denied']);
  let choice = null;
  try { choice = localStorage.getItem(CONSENT_KEY); } catch (_) {}
  if (!validChoices.has(choice)) choice = null;

  let googleTagConfigured = false;
  let googleTagScriptAdded = false;
  let gtmScriptAdded = false;

  function consentState(value) {
    const allowAnalytics = value === 'analytics' || value === 'all';
    const allowAds = value === 'all';
    return {
      analytics_storage: allowAnalytics ? 'granted' : 'denied',
      ad_storage: allowAds ? 'granted' : 'denied',
      ad_user_data: allowAds ? 'granted' : 'denied',
      ad_personalization: allowAds ? 'granted' : 'denied'
    };
  }

  function addScript(id, src, consentLabel) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.id = id;
    script.setAttribute('data-consent-dependent', consentLabel);
    document.head.appendChild(script);
  }

  function applyChoice(value) {
    const state = consentState(value);
    const allowAnalytics = value === 'analytics' || value === 'all';
    const allowAds = value === 'all';
    window.googleAdsConsent = allowAds;
    window.googleAnalyticsConsent = allowAnalytics;

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', state);
    }

    if (!allowAnalytics) {
      window.gtmActive = false;
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    if (!window.googleConsentDefaultSet) {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      window.googleConsentDefaultSet = true;
    }
    window.gtag('consent', 'update', state);

    if (!googleTagConfigured) {
      window.gtag('js', new Date());
      window.gtag('config', GOOGLE_TAG_ID);
      googleTagConfigured = true;
    }
    if (!googleTagScriptAdded) {
      addScript('google-tag-consent', `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`, 'google-tag');
      googleTagScriptAdded = true;
    }

    if (allowAds && !gtmScriptAdded) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      addScript('google-tag-manager-consent', `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`, 'google-tag-manager');
      gtmScriptAdded = true;
    }
    window.gtmActive = allowAds;
  }

  function saveChoice(value) {
    choice = value;
    try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
    if (banner) banner.hidden = true;
    applyChoice(value);
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

  if (choice) applyChoice(choice);

  // The GA4 event is analytics-only; the GTM custom event is emitted only with full consent.
  // Both events cover only the five primary WhatsApp buttons and never include message text.
  document.querySelectorAll('.buttons a.btn[href^="https://wa.me/"]').forEach(link => {
    link.addEventListener('click', () => {
      const label = link.textContent.trim().replace(/\s+/g, ' ');
      if (window.googleAnalyticsConsent && typeof window.gtag === 'function') {
        window.gtag('event', 'whatsapp_click', { whatsapp_button: label });
      }
      if (window.gtmActive && window.googleAdsConsent) {
        window.dataLayer.push({ event: 'whatsapp_click', whatsapp_button: label });
      }
    });
  });
})();
