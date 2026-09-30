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

export function scrollToTarget(target: HTMLElement, { center = false, immediate = false }: { center?: boolean; immediate?: boolean } = {}) {
  if (!smoothScroller) {
    target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: center ? 'center' : 'start' });
    return;
  }
  const offset = center ? -window.innerHeight / 2 + target.getBoundingClientRect().height / 2 : -80;
  smoothScroller.scrollTo(target, { offset, duration: immediate ? 0 : 1 });
}
