import { usePortfolio } from '../../context/PortfolioContext';
import { GuideCharacter } from '../guide/GuideCharacter';
import { SectionHeading } from '../ui/SectionHeading';
import { Timeline } from '../ui/Timeline';

export function Experience() {
  const { data } = usePortfolio();
  if (!data.experience.length) return null;
  const items = [...data.experience].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return <section id="experience" className="portfolio-section experience-section" aria-labelledby="experience-heading">
    <div className="container">
      <SectionHeading label="07 / EXPERIENCE" title="Where I’ve contributed" />
      <div className="experience-layout">
        <Timeline items={items.map((item) => ({
          title: item.role,
          subtitle: item.company,
          date: [item.startDate, item.current ? 'Present' : item.endDate].filter(Boolean).join(' — '),
          description: item.description,
          current: item.current,
          tags: item.techStack,
        }))} />
        <GuideCharacter src="/images/cutouts/06_experience_arms-crossed.png" side="right" alt="Yakshit standing with arms crossed" />
      </div>
    </div>
  </section>;
}
