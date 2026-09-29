import { Helmet } from 'react-helmet-async';
import { Home } from 'lucide-react';

export function NotFound() {
  return <>
    <Helmet><title>Page not found | Yakshit Portfolio</title><meta name="robots" content="noindex, follow" /></Helmet>
    <main className="not-found-page"><span className="not-found-code">404</span><h1>This page isn’t here.</h1><p>The address may have changed or the page may not exist.</p><a href="/" className="glow-button glow-button--primary"><Home size={17} /> Back home</a></main>
  </>;
}
