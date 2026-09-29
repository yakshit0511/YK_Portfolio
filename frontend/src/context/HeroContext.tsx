import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface HeroContextValue {
  sequenceDone: boolean;
  setSequenceDone: (done: boolean) => void;
}

const HeroContext = createContext<HeroContextValue | null>(null);

export function HeroProvider({ children }: { children: ReactNode }) {
  const [sequenceDone, setSequenceDone] = useState(false);
  const value = useMemo(() => ({ sequenceDone, setSequenceDone }), [sequenceDone]);
  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>;
}

function useHeroContextValue(): HeroContextValue {
  const value = useContext(HeroContext);
  if (!value) throw new Error('Hero context must be used inside HeroProvider.');
  return value;
}

export function useHeroContext(): { sequenceDone: boolean } {
  const { sequenceDone } = useHeroContextValue();
  return { sequenceDone };
}

export function useSetSequenceDone(): (done: boolean) => void {
  return useHeroContextValue().setSequenceDone;
}
