import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrivacyConsent } from '../src/components/layout/PrivacyConsent';
import { trackPortfolioEvent } from '../src/utils/analytics';

describe('privacy-friendly analytics', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 204 }))));
  });

  it('does not send events before the visitor opts in', () => {
    trackPortfolioEvent('pageview');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends only minimal analytics after explicit opt-in', () => {
    window.localStorage.setItem('portfolio-analytics-consent', 'accepted');
    trackPortfolioEvent('project_view', 'sample-project');

    expect(fetch).toHaveBeenCalledWith('/api/public/track', expect.objectContaining({
      method: 'POST',
      keepalive: true,
      body: expect.stringContaining('sample-project'),
    }));
    expect(String(vi.mocked(fetch).mock.calls[0][1]?.body)).not.toContain('email');
  });

  it('persists a visitor choice and allows declining analytics', () => {
    render(<PrivacyConsent />);
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(window.localStorage.getItem('portfolio-analytics-consent')).toBe('rejected');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});