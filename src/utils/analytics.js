// Privacy-friendly analytics loader (Umami-like), gated by consent and env
export function loadAnalytics() {
  try {
    const enabled = localStorage.getItem('sc:analytics:enabled') === '1';
    const scriptUrl = import.meta?.env?.VITE_UMAMI_URL;
    const websiteId = import.meta?.env?.VITE_UMAMI_WEBSITE_ID;
    if (!enabled || !scriptUrl || !websiteId) return;
    const s = document.createElement('script');
    s.async = true;
    s.defer = true;
    s.setAttribute('data-website-id', websiteId);
    s.src = scriptUrl;
    document.head.appendChild(s);
  } catch (_) {}
}
