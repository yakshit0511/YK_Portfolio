import { Helmet } from 'react-helmet-async';
import { usePortfolio } from '../context/PortfolioContext';
import { Hero } from '../components/hero/Hero';
import { About } from '../components/sections/About';
import { Skills } from '../components/sections/Skills';
import { Projects } from '../components/sections/Projects';
import { Certificates } from '../components/sections/Certificates';
import { GithubActivity } from '../components/sections/GithubActivity';
import { Education } from '../components/sections/Education';
import { Experience } from '../components/sections/Experience';
import { Contact } from '../components/sections/Contact';

const sectionElements = {
  about: <About />,
  skills: <Skills />,
  projects: <Projects />,
  certificates: <Certificates />,
  github: <GithubActivity />,
  education: <Education />,
  experience: <Experience />,
  contact: <Contact />,
};

export function Home() {
  const { data } = usePortfolio();
  const profile = data.profile;
  const title = profile?.seo?.title || 'Yakshit Portfolio | Full Stack MERN Developer';
  const description = profile?.seo?.description || 'Yakshit Koshiya is a Full Stack MERN Developer building modern, responsive web applications.';
  const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');

  return <>
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${siteUrl}/`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${siteUrl}/`} />
      <meta property="og:image" content={`${siteUrl}/og-image.png`} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
      <meta name="robots" content="index, follow" />
    </Helmet>
    <main id="top">
      <Hero />
      {[...data.sections].sort((a, b) => a.order - b.order).map((section) => {
        if (!section.visible || (section.key === 'experience' && data.experience.length === 0)) return null;
        return <div key={section.key}>{sectionElements[section.key]}</div>;
      })}
    </main>
  </>;
}
