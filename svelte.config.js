import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte'],
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapter({
			// Use 'edge' runtime instead of 'edge: true'
			runtime: 'edge',
			// Keep the split option
			split: true
		}),
		alias: {
			'@/*': './path/to/lib/*'
		}
	}
};

export default config;