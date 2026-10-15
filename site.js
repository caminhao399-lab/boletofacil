(() => {
  const CONSENT_KEY = 'boletofacil_google_consent_v2';
  const GTM_ID = 'GTM-MF2H48XN';
  // Configure the supplied GA4 ID G-G24QSMX7JK inside GTM; do not add a second gtag.js install here.
  const banner = document.querySelector('#consent-notice');
  const validChoices = new Set(['all', 'analytics', 'denied']);
  let choice = null;
  try { choice = localStorage.getItem(CONSENT_KEY); } catch (_) {}
  if (!validChoices.has(choice)) choice = null;

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

  function applyChoice(value) {
    const state = consentState(value);
    window.googleAdsConsent = value === 'all';
    window.googleAnalyticsConsent = value === 'analytics' || value === 'all';

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', state);
    }

    if (value === 'denied' || !value) {
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
    window.gtmActive = true;

    if (!gtmScriptAdded) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      script.id = 'google-tag-manager-consent';
      script.setAttribute('data-consent-dependent', 'google-tag-manager');
      document.head.appendChild(script);
      gtmScriptAdded = true;
    }
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

  // Custom event for a future GTM conversion tag: only the five primary WhatsApp buttons.
  // It records the click, not whether WhatsApp opened or a message was sent.
  document.querySelectorAll('.buttons a.btn[href^="https://wa.me/"]').forEach(link => {
    link.addEventListener('click', () => {
      if (!window.gtmActive || !window.googleAdsConsent) return;
      window.dataLayer.push({
        event: 'whatsapp_click',
        whatsapp_button: link.textContent.trim().replace(/\s+/g, ' ')
      });
    });
  });
})();
