import type Lenis from 'lenis';

let smoothScroller: Lenis | null = null;

export function setSmoothScroller(instance: Lenis | null) {
  smoothScroller = instance;
}

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (smoothScroller) smoothScroller.scrollTo(target, { offset: -80 });
  else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
