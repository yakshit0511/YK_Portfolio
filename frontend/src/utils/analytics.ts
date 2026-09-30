export type PortfolioEventType = 'pageview' | 'project_view' | 'project_link' | 'resume_download' | 'social_click' | 'contact_submit';

export function trackPortfolioEvent(type: PortfolioEventType, target?: string) {
  try {
    if (window.localStorage.getItem('portfolio-analytics-consent') !== 'accepted') return;
    const device = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
    void fetch('/api/public/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, target, device }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Tracking remains optional when browser storage or network access is unavailable.
  }
}