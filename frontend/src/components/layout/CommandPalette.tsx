import { useEffect, useRef, useState } from 'react';
import { Command, CornerDownLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { scrollToSection } from '../../utils/smoothScroll';

type CommandItem = { label: string; detail: string; action: () => void };

export function CommandPalette() {
  const { data } = usePortfolio();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const openPalette = () => { setOpen(true); setQuery(''); };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPalette();
      } else if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('portfolio:open-command-palette', openPalette);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('portfolio:open-command-palette', openPalette);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const commands: CommandItem[] = [
    ...data.sections.filter((section) => section.visible).map((section) => ({
      label: `Go to ${section.title}`,
      detail: 'Section',
      action: () => { navigate('/'); window.setTimeout(() => scrollToSection(section.key), 40); },
    })),
    ...data.projects.filter((project) => project.slug).map((project) => ({
      label: project.title,
      detail: 'Case study',
      action: () => navigate(`/projects/${project.slug}`),
    })),
    {
      label: 'Toggle lite mode',
      detail: 'Display',
      action: () => window.dispatchEvent(new CustomEvent('portfolio:toggle-lite')),
    },
  ];
  const filteredCommands = commands.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8);

  if (!open) return null;
  return <div className="command-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
    <section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="command-search"><Search size={18} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sections and projects" aria-label="Search commands" /><kbd>ESC</kbd></div>
      <p className="command-list-label"><Command size={13} /> PORTFOLIO COMMANDS</p>
      <div className="command-list" role="listbox">
        {filteredCommands.map((item) => <button type="button" role="option" aria-selected="false" key={`${item.detail}-${item.label}`} onClick={() => { setOpen(false); item.action(); }}><span>{item.label}</span><small>{item.detail}</small><CornerDownLeft size={14} /></button>)}
        {!filteredCommands.length && <p className="command-empty">No matching commands.</p>}
      </div>
    </section>
  </div>;
}