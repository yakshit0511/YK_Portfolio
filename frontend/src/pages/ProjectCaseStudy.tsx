import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Github } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fetchProjectBySlug } from '../api/portfolio';
import { usePortfolio } from '../context/PortfolioContext';
import type { Project } from '../types/portfolio';
import { cloudinaryImageUrl } from '../utils/cloudinaryUrl';

export function ProjectCaseStudy() {
  const { slug = '' } = useParams();
  const { data, loading: portfolioLoading } = usePortfolio();
  const [remoteProject, setRemoteProject] = useState<Project | null>(null);
  const [requestPending, setRequestPending] = useState(true);
  const project = data.projects.find((item) => item.slug === slug) || remoteProject;
  const projects = data.projects;
  const currentIndex = projects.findIndex((item) => item.slug === slug);
  const previous = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  useEffect(() => {
    let active = true;
    setRemoteProject(null);
    setRequestPending(true);
    fetchProjectBySlug(slug)
      .then((result) => { if (active) setRemoteProject(result); })
      .catch(() => undefined)
      .finally(() => { if (active) setRequestPending(false); });
    return () => { active = false; };
  }, [slug]);

  if (!project && (portfolioLoading || requestPending)) return <main className="case-study-state container" role="status">Loading case study…</main>;
  if (!project) return <main className="case-study-state container"><p className="eyebrow">PROJECT / NOT FOUND</p><h1>This case study is unavailable.</h1><Link className="case-study-back" to="/"><ArrowLeft size={16} /> Back to portfolio</Link></main>;

  const title = project.title;
  const description = project.shortDescription || project.description || 'Project details and implementation notes.';
  return <main className="case-study-page container">
    <Link className="case-study-back" to="/"><ArrowLeft size={16} /> All projects</Link>
    <header className="case-study-header">
      <p className="eyebrow">CASE STUDY / {project.status || 'COMPLETED'}</p>
      <h1>{title}</h1>
      <p className="case-study-lede">{description}</p>
      <div className="case-study-facts">
        {project.role && <span><b>Role</b>{project.role}</span>}
        {project.duration && <span><b>Duration</b>{project.duration}</span>}
      </div>
      <div className="case-study-actions">
        {project.liveUrl && <a className="glow-button glow-button--primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> Live project</a>}
        {project.githubUrl && <a className="glow-button glow-button--outline" href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github size={16} /> Source code</a>}
      </div>
    </header>
    {project.images?.[0] && <figure className="case-study-cover"><img src={cloudinaryImageUrl(project.images[0].url, 1400)} alt={`${title} project preview`} width={1400} height={788} /></figure>}
    <div className="case-study-content">
      <section><p className="eyebrow">01 / THE PROBLEM</p><h2>Problem</h2><p>{project.problem || project.description || description}</p></section>
      <section><p className="eyebrow">02 / THE APPROACH</p><h2>Solution</h2><p>{project.solution || 'The project was designed around the core user needs and delivered as a responsive, maintainable experience.'}</p></section>
      {project.features?.length ? <section><p className="eyebrow">03 / DELIVERY</p><h2>Key features</h2><ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section> : null}
      {project.challenges ? <section><p className="eyebrow">04 / ENGINEERING</p><h2>Challenges & decisions</h2><p>{project.challenges}</p></section> : null}
      {project.techStack?.length ? <section><p className="eyebrow">TOOLS / STACK</p><div className="chip-row">{project.techStack.map((tech) => <span className="skill-chip" key={tech}>{tech}</span>)}</div></section> : null}
    </div>
    <nav className="case-study-pagination" aria-label="Other case studies">
      {previous ? <Link to={`/projects/${previous.slug}`}><ArrowLeft size={16} /><span><small>Previous</small>{previous.title}</span></Link> : <span />}
      {next ? <Link to={`/projects/${next.slug}`}><span><small>Next</small>{next.title}</span><ArrowRight size={16} /></Link> : <span />}
    </nav>
  </main>;
}