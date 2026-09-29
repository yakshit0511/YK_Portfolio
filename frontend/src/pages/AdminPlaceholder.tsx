import { Helmet } from 'react-helmet-async';

export function AdminPlaceholder() {
  return <>
    <Helmet><title>Admin | Yakshit Portfolio</title><meta name="robots" content="noindex, nofollow" /></Helmet>
    <main className="placeholder-page"><span className="eyebrow">PRIVATE WORKSPACE</span><h1>Admin panel coming soon</h1><p>The portfolio management area is being prepared.</p><a href="/" className="text-link">Return to portfolio</a></main>
  </>;
}
