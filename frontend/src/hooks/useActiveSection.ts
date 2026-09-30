import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState('');
  const sectionKey = sectionIds.join('|');

  useEffect(() => {
    const targets = sectionKey.split('|').filter(Boolean).map((id) => document.getElementById(id)).filter((item): item is HTMLElement => Boolean(item));
    if (!targets.length) return;
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActiveId(current.target.id);
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.2, 0.5] });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sectionKey]);

  return activeId;
}
