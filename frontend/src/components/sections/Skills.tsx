import { lazy, Suspense } from 'react';
import { Braces, Database, Layers3, Server, Wrench } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { fallbackData } from '../../data/fallbackData';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLowPower } from '../../hooks/useLowPower';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { TiltCard } from '../ui/TiltCard';
import { SkillChips } from '../skills/SkillChips';

const SkillsOrb = lazy(() => import('../skills/SkillsOrb'));
const categoryIcons: Record<string, typeof Braces> = {
  Frontend: Braces, Backend: Server, Database, 'Tools & Deployment': Wrench, Other: Layers3,
};

export function Skills() {
  const { data } = usePortfolio();
  const isMobile = useIsMobile();
  const lowPower = useLowPower();
  const reducedMotion = useReducedMotion();
  const skillGroups = data.skills.length ? data.skills : fallbackData.skills;
  const groups = [...skillGroups].sort((a, b) => ['Frontend', 'Backend', 'Database', 'Tools & Deployment', 'Other'].indexOf(a.category) - ['Frontend', 'Backend', 'Database', 'Tools & Deployment', 'Other'].indexOf(b.category));
  const names = groups.flatMap((group) => group.items.filter((skill) => skill.visible !== false).map((skill) => skill.name));
  const orbNames = [
    'React.js', 'Node.js', 'MongoDB', 'TypeScript', 'JavaScript',
    'HTML5', 'CSS3', 'Vercel',
  ].filter((name) => names.includes(name));
  const showOrb = !isMobile && !lowPower && !reducedMotion && orbNames.length > 0;

  return <section id="skills" className="portfolio-section skills-section" aria-labelledby="skills-heading">
    <div className="container">
      <SectionHeading label="02 / SKILLS" title="Tools of the trade" />
      <div className={`skills-layout${showOrb ? ' skills-layout--orb' : ''}`}>
        <div className="skills-cards">{groups.map((group, index) => {
          const Icon = categoryIcons[group.category] ?? Layers3;
          const skills = group.items.filter((skill) => skill.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          if (!skills.length) return null;
          return <Reveal key={group.category} delay={index * 0.06}>
            <TiltCard className="skill-category-card">
              <div className="skill-category-title"><span className="skill-category-icon"><Icon size={19} /></span><h3>{group.category}</h3><span className="category-count">{String(skills.length).padStart(2, '0')}</span></div>
              <SkillChips skills={skills} />
            </TiltCard>
          </Reveal>;
        })}</div>
        {showOrb && <div className="skills-orb-column">
          <Suspense fallback={<div className="skills-orb-placeholder" aria-hidden="true" />}><SkillsOrb names={orbNames} /></Suspense>
        </div>}
      </div>
    </div>
  </section>;
}
