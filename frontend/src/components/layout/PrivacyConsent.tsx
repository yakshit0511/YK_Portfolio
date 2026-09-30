import { useEffect, useState } from 'react';
import { Check, Shield, X } from 'lucide-react';
import { trackPortfolioEvent } from '../../utils/analytics';

const consentKey = 'portfolio-analytics-consent';

export function PrivacyConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(!window.localStorage.getItem(consentKey));
    } catch {
      setVisible(false);
    }
    const openSettings = () => setVisible(true);
    window.addEventListener('portfolio:privacy-settings', openSettings);
    return () => window.removeEventListener('portfolio:privacy-settings', openSettings);
  }, []);

  const choose = (choice: 'accepted' | 'rejected') => {
    try { window.localStorage.setItem(consentKey, choice); } catch { /* Storage is optional. */ }
    setVisible(false);
    if (choice === 'accepted') trackPortfolioEvent('pageview');
  };

  if (!visible) return null;
  return <aside className="privacy-consent" role="dialog" aria-labelledby="privacy-consent-title" aria-describedby="privacy-consent-description">
    <div className="privacy-consent-icon"><Shield size={19} /></div>
    <div className="privacy-consent-copy">
      <h2 id="privacy-consent-title">Privacy-friendly insights</h2>
      <p id="privacy-consent-description">Allow anonymous, aggregated visit counts. No analytics are sent unless you opt in.</p>
    </div>
    <div className="privacy-consent-actions">
      <button type="button" onClick={() => choose('accepted')}><Check size={15} /> Allow</button>
      <button type="button" className="privacy-decline" onClick={() => choose('rejected')}><X size={15} /> Decline</button>
    </div>
  </aside>;
}