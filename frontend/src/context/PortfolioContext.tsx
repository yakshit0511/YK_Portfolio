import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchPortfolio } from '../api/portfolio';
import { fallbackData } from '../data/fallbackData';
import type { PortfolioData } from '../types/portfolio';

interface PortfolioContextValue {
  data: PortfolioData;
  loading: boolean;
  error: string | null;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPortfolio()
      .then((result) => {
        if (!active) return;
        const safeProfile = result.profile
          ? {
              ...fallbackData.profile!,
              ...result.profile,
              typingTitles: result.profile.typingTitles?.length
                ? result.profile.typingTitles
                : fallbackData.profile!.typingTitles,
              about: result.profile.about || fallbackData.profile!.about,
              socials: { ...fallbackData.profile!.socials, ...result.profile.socials },
              seo: { ...fallbackData.profile!.seo, ...result.profile.seo },
            }
          : fallbackData.profile;
        if (safeProfile) delete (safeProfile as typeof safeProfile & { phone?: string }).phone;
        setData({ ...fallbackData, ...result, profile: safeProfile });
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'Portfolio API is unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return <PortfolioContext.Provider value={{ data, loading, error }}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioContextValue {
  const value = useContext(PortfolioContext);
  if (!value) throw new Error('usePortfolio must be used inside PortfolioProvider.');
  return value;
}
