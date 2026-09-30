import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, ExternalLink, Github, X } from 'lucide-react';
import type { Project } from '../../types/portfolio';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cloudinaryImageUrl } from '../../utils/cloudinaryUrl';

export default function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [imageIndex, setImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const images = project?.images ?? [];
  const currentImage = images[imageIndex];

  useEffect(() => {
    if (!project) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
    focusable?.[0]?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && images.length > 1) setImageIndex((index) => (index - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight' && images.length > 1) setImageIndex((index) => (index + 1) % images.length);
      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [images.length, onClose, project]);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => setTouchStart(event.changedTouches[0]?.clientX ?? 0);
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
    if (Math.abs(delta) < 45 || images.length < 2) return;
    setImageIndex((index) => (index + (delta < 0 ? 1 : -1) + images.length) % images.length);
  };

  const dialog = <AnimatePresence>
    {project && <motion.div key={project.slug || project.title} className="project-modal-backdrop" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.2 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div ref={dialogRef} className="project-modal glass" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }} transition={{ duration: reducedMotion ? 0 : 0.25 }}>
        <button className="project-modal-close icon-button" type="button" onClick={onClose} aria-label="Close project details"><X size={19} /></button>
        {currentImage && <div className="project-modal-image" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <img src={cloudinaryImageUrl(currentImage.url, 1400)} alt={`${project.title} screenshot ${imageIndex + 1}`} width={1400} height={788} />
          {images.length > 1 && <>
            <button className="carousel-arrow carousel-arrow--left" type="button" aria-label="Previous image" onClick={() => setImageIndex((index) => (index - 1 + images.length) % images.length)}><ArrowLeft size={18} /></button>
            <button className="carousel-arrow carousel-arrow--right" type="button" aria-label="Next image" onClick={() => setImageIndex((index) => (index + 1) % images.length)}><ArrowRight size={18} /></button>
            <div className="carousel-dots" role="group" aria-label="Choose project image">{images.map((image, index) => <button key={`${image.url}-${index}`} type="button" className={index === imageIndex ? 'is-active' : ''} aria-label={`Show image ${index + 1}`} aria-pressed={index === imageIndex} onClick={() => setImageIndex(index)} />)}</div>
          </>}
        </div>}
        <div className="project-modal-content">
          <span className="eyebrow">PROJECT DETAILS</span>
          <h2 id="project-modal-title">{project.title}</h2>
          <p className="project-full-description">{project.description || project.shortDescription}</p>
          <div className="chip-row">{(project.techStack ?? []).map((tech) => <span className="skill-chip" key={tech}>{tech}</span>)}</div>
          <div className="project-modal-actions">
            {project.liveUrl && <a className="glow-button glow-button--primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />Live Demo</a>}
            {project.githubUrl && <a className="glow-button glow-button--outline" href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github size={16} />Source Code</a>}
          </div>
        </div>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;

  return createPortal(dialog, document.body);
}
