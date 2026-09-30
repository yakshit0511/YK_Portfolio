import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), 'VITE_');
	const siteUrl = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
	const analyze = process.env.ANALYZE === 'true';

	return {
		plugins: [
			react(),
			{
				name: 'site-url-html',
				transformIndexHtml(html) {
					return html.replaceAll('%VITE_SITE_URL%', siteUrl);
				},
			},
			...(analyze ? [visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true, open: false })] : []),
		],
		define: {
			'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl),
		},
		build: {
			sourcemap: false,
			chunkSizeWarningLimit: 700,
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (/\/node_modules\/(react|react-dom|react-router-dom|@remix-run\/router)\//.test(id)) return 'react-vendor';
						if (id.includes('/node_modules/framer-motion/')) return 'motion-vendor';
						if (/\/node_modules\/(three|@react-three\/fiber|@react-three\/drei)\//.test(id)) return 'three-vendor';
					},
				},
			},
		},
	};
});
