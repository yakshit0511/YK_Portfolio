import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ExternalLink, Github, MoreHorizontal } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { GuideCharacter } from '../guide/GuideCharacter';
import { SectionHeading } from '../ui/SectionHeading';
import { TiltCard } from '../ui/TiltCard';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const ProjectModal = lazy(() => import('./ProjectModal'));

export function Projects() {
  const { data } = usePortfolio();
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState('All');
  const [moreFilter, setMoreFilter] = useState('');
  const [selected, setSelected] = useState<(typeof data.projects)[number] | null>(null);
  const [modalRequested, setModalRequested] = useState(false);
  const projects = useMemo(() => [...data.projects].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.order ?? 0) - (b.order ?? 0)), [data.projects]);
  const allTech = [...new Set(projects.flatMap((project) => project.techStack ?? []))].sort();
  const primaryTech = allTech.slice(0, 8);
  const overflowTech = allTech.slice(8);
  const activeFilter = moreFilter || filter;
  const visibleProjects = projects.filter((project) => activeFilter === 'All' || (project.techStack ?? []).includes(activeFilter));

  const filterTo = (value: string) => {
    if (overflowTech.includes(value)) { setMoreFilter(value); setFilter(''); }
    else { setFilter(value); setMoreFilter(''); }
  };
  const openProject = (project: (typeof data.projects)[number]) => { setSelected(project); setModalRequested(true); };
  const closeProject = useCallback(() => setSelected(null), []);

  return <section id="projects" className="portfolio-section projects-section" aria-labelledby="projects-heading">
    <div className="container">
      <SectionHeading label="03 / PROJECTS" title="Selected work" />
      <GuideCharacter src="/images/cutouts/03_projects_holding-laptop.png" side="right" alt="Yakshit presenting a project" className="projects-guide" />
      {projects.length > 0 ? <>
        <div className="project-filter-bar" role="group" aria-label="Filter projects by technology">
          {['All', ...primaryTech].map((tech) => <button key={tech} className={`filter-chip${activeFilter === tech ? ' is-active' : ''}`} type="button" aria-pressed={activeFilter === tech} onClick={() => filterTo(tech)}>{tech}</button>)}
          {overflowTech.length > 0 && <label className="more-filter"><MoreHorizontal size={15} /><span className="sr-only">More technologies</span><select value={overflowTech.includes(activeFilter) ? activeFilter : ''} onChange={(event) => filterTo(event.target.value)} aria-label="More technologies"><option value="">More</option>{overflowTech.map((tech) => <option key={tech} value={tech}>{tech}</option>)}</select></label>}
        </div>
        <LayoutGroup>
          <motion.div className="projects-grid" layout={!reducedMotion}>
            <AnimatePresence mode="popLayout" initial={false}>{visibleProjects.map((project) => <motion.article key={project.slug || project.title} layout={!reducedMotion} initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, scale: 0.97 }} transition={{ duration: reducedMotion ? 0 : 0.25 }}>
              <TiltCard className="project-card">
                <button className="project-card-open" type="button" onClick={() => openProject(project)} aria-label={`View details for ${project.title}`}>
                  <div className={`project-cover${project.images?.[0] ? '' : ' project-cover--empty'}`}>
                    {project.images?.[0] && <img src={project.images[0].url} alt={`${project.title} preview`} loading="lazy" width="640" height="360" onError={(event) => event.currentTarget.remove()} />}
                    {project.featured && <span className="featured-badge">Featured</span>}
                  </div>
                  <div className="project-card-content">
                    <h3>{project.title}</h3>
                    <p className="project-short-description">{project.shortDescription || project.description}</p>
                    <div className="chip-row">{(project.techStack ?? []).slice(0, 4).map((tech) => <span className="skill-chip" key={tech}>{tech}</span>)}{(project.techStack?.length ?? 0) > 4 && <span className="skill-chip">+{(project.techStack?.length ?? 0) - 4}</span>}</div>
                  </div>
                </button>
                <div className="project-card-links">
                  {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} live demo`} onClick={(event) => event.stopPropagation()}><ExternalLink size={17} /></a>}
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} source code`} onClick={(event) => event.stopPropagation()}><Github size={17} /></a>}
                </div>
              </TiltCard>
            </motion.article>)}</AnimatePresence>
          </motion.div>
        </LayoutGroup>
        {visibleProjects.length === 0 && <p className="projects-empty-filter">No projects use {activeFilter} yet.</p>}
      </> : <div className="projects-empty-state"><p>Projects are on the way. Check back soon.</p></div>}
    </div>
    {modalRequested && <Suspense fallback={null}><ProjectModal project={selected} onClose={closeProject} /></Suspense>}
  </section>;
}
