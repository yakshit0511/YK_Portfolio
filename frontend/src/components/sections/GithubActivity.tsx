import { useEffect, useState } from 'react';
import { ExternalLink, GitFork, Github, Star } from 'lucide-react';
import { fetchGithubActivity } from '../../api/portfolio';
import type { GithubActivityData } from '../../types/portfolio';
import { usePortfolio } from '../../context/PortfolioContext';
import { SectionHeading } from '../ui/SectionHeading';
import { TiltCard } from '../ui/TiltCard';

export function GithubActivity() {
  const { data } = usePortfolio();
  const [activity, setActivity] = useState<GithubActivityData | null>(null);

  useEffect(() => {
    let active = true;
    fetchGithubActivity()
      .then((result) => { if (active) setActivity(result); })
      .catch(() => { if (active) setActivity({ available: false }); });
    return () => { active = false; };
  }, []);

  const profileUrl = data.profile?.socials.github;
  const safeProfileUrl = profileUrl
    ? /^https:\/\//i.test(profileUrl) ? profileUrl : `https://github.com/${profileUrl.replace(/^@/, '')}`
    : undefined;
  if (activity && !activity.available && !profileUrl) return null;

  return <section id="github" className="portfolio-section github-section" aria-labelledby="github-heading">
    <div className="container">
      <SectionHeading label="05 / OPEN SOURCE" title="GitHub activity" />
      {activity?.available && activity.user ? <>
        <div className="github-summary">
          <a className="github-profile" href={activity.user.profileUrl} target="_blank" rel="noopener noreferrer"><Github size={23} /><span>@{activity.user.login}</span><ExternalLink size={14} /></a>
          <span>{activity.user.publicRepos} public repositories</span>
          <span>{activity.user.followers} followers</span>
          <span><Star size={14} /> {activity.stats?.totalStars ?? 0} stars</span>
        </div>
        {activity.stats?.topLanguages.length ? <div className="github-languages" aria-label="Most used repository languages">{activity.stats.topLanguages.map((language) => <span className="skill-chip" key={language.name}>{language.name}<b>{language.count}</b></span>)}</div> : null}
        <div className="github-repositories">
          {activity.repos?.map((repo) => (
            <TiltCard key={repo.name} className="github-repository-tilt">
              <article className="github-repository">
                <a href={repo.url} target="_blank" rel="noopener noreferrer"><h3>{repo.name}</h3><ExternalLink size={15} /></a>
                <p>{repo.description || 'Open-source repository with modern architecture and clean codebase.'}</p>
                <div className="github-repo-meta">
                  {repo.language && <span>{repo.language}</span>}
                  <span><Star size={13} /> {repo.stars}</span>
                  <span><GitFork size={13} /> {repo.forks}</span>
                </div>
              </article>
            </TiltCard>
          ))}
        </div>
        {activity.stale && <p className="github-cache-note">Showing the latest cached GitHub data.</p>}
      </> : <div className="github-unavailable"><Github size={22} /><p>GitHub activity is temporarily unavailable.</p>{safeProfileUrl && <a href={safeProfileUrl} target="_blank" rel="noopener noreferrer">Visit profile <ExternalLink size={14} /></a>}</div>}
    </div>
  </section>;
}