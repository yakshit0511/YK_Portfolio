import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function TypingText({ titles }: { titles: string[] }) {
  const reducedMotion = useReducedMotion();
  const [titleIndex, setTitleIndex] = useState(0);
  const [text, setText] = useState(reducedMotion ? (titles[0] ?? '') : '');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reducedMotion || titles.length === 0) {
      setText(titles[0] ?? '');
      return;
    }
    const current = titles[titleIndex % titles.length] ?? '';
    const delay = deleting ? 42 : text.length === current.length ? 1500 : 78;
    const timer = window.setTimeout(() => {
      if (!deleting && text === current) setDeleting(true);
      else if (deleting && text.length === 0) {
        setDeleting(false);
        setTitleIndex((index) => (index + 1) % titles.length);
      } else setText(current.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [deleting, reducedMotion, text, titleIndex, titles]);

  return <span className="typing-line" aria-label={titles[titleIndex % Math.max(titles.length, 1)] ?? ''}>{text}<span className="typing-cursor" aria-hidden="true">|</span></span>;
}
