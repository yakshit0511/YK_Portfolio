import { Helmet } from 'react-helmet-async';
import { usePortfolio } from '../context/PortfolioContext';
import { Hero } from '../components/hero/Hero';

export function Home() {
  const { data } = usePortfolio();
  const profile = data.profile;
  const title = profile?.seo?.title || 'Yakshit Portfolio | Full Stack MERN Developer';
  const description = profile?.seo?.description || 'Yakshit Koshiya is a Full Stack MERN Developer building modern, responsive web applications.';

  return <>
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/images/backgrounds/room-bg.jpg.png" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/images/backgrounds/room-bg.jpg.png" />
      <meta name="robots" content="index, follow" />
    </Helmet>
    <main id="top"><Hero /></main>
  </>;
}
