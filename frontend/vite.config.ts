import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	build: {
		chunkSizeWarningLimit: 700,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('/node_modules/three/')) return 'three';
					if (id.includes('/node_modules/@react-three/fiber/')) return 'react-three-fiber';
					if (id.includes('/node_modules/@react-three/drei/')) return 'react-three-drei';
				},
			},
		},
	},
});
