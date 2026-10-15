document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
  link.addEventListener('click', () => {
    const message = new URL(link.href).searchParams.get('text') || '';
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'whatsapp_click',
      whatsapp_message: message,
      whatsapp_button: link.textContent.trim().replace(/\s+/g, ' ')
    });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'contact',
        event_label: message
      });
    }
  });
});
