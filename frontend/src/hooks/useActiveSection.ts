import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState('');
  const sectionKey = sectionIds.join('|');

  useEffect(() => {

    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
        const targets = sectionKey.split('|').filter(Boolean).map((id) => document.getElementById(id)).filter((item): item is HTMLElement => Boolean(item));
      const activationLine = Math.min(360, Math.max(180, window.innerHeight * 0.45));
      let nextActiveId = '';

      for (const target of targets) {
        if (target.getBoundingClientRect().top <= activationLine) nextActiveId = target.id;
      }

      setActiveId((current) => current === nextActiveId ? current : nextActiveId);
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

      const contentObserver = new MutationObserver(scheduleUpdate);
      contentObserver.observe(document.getElementById('top') ?? document.body, { childList: true, subtree: true });
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
        contentObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sectionKey]);

  return activeId;
}
