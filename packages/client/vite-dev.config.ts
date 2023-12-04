import pluginVue from '@vitejs/plugin-vue';
import { defineConfig, type UserConfig } from 'vite';

import locales from '../../locales';
import meta from '../../package.json';
import pluginJson5 from "./vite.json5";

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.json5', '.svg', '.sass', '.scss', '.css', '.vue'];

export function getConfig(): UserConfig {
	return {
		root: 'src',
		publicDir: '../assets',
		base: './',
		server: {
			host: '127.0.0.1',
			port: 5173,
			proxy: {
				'/api': {
					changeOrigin: true,
					target: 'http://127.0.0.1:3000/',
				},
				'/assets': 'http://127.0.0.1:3000/',
				'/files': 'http://127.0.0.1:3000/',
				'/twemoji': 'http://127.0.0.1:3000/',
				'/fluent-emoji': 'http://127.0.0.1:3000/',
				'/sw.js': 'http://127.0.0.1:3000/',
				'/streaming': {
					target: 'ws://127.0.0.1:3000/',
					ws: true,
				},
				'/favicon.ico': 'http://127.0.0.1:3000/',
				'/identicon': {
					target: 'http://127.0.0.1:3000/',
					rewrite(path) {
						return path.replace('@127.0.0.1:5173', '');
					},

				},
				'/url': 'http://127.0.0.1:3000',
				'/proxy': 'http://127.0.0.1:3000',
			},
		},

		plugins: [
			pluginVue({
				reactivityTransform: true,
			}),
			pluginJson5(),
		],

		resolve: {
			extensions,
			alias: {
				'@/': __dirname + '/src/',
				'/client-assets/': __dirname + '/assets/',
				'/static-assets/': __dirname + '/../backend/assets/',
				'/fluent-emojis/': __dirname + '/../../fluent-emojis/dist/',
				'/fluent-emoji/': __dirname + '/../../fluent-emojis/dist/',
			},
		},

		define: {
			_VERSION_: JSON.stringify(meta.version),
			_LANGS_: JSON.stringify(Object.entries(locales).map(([k, v]) => [k, v._lang_])),
			_ENV_: JSON.stringify(process.env.NODE_ENV),
			_DEV_: process.env.NODE_ENV !== 'production',
			_PERF_PREFIX_: JSON.stringify('Misskey:'),
			_DATA_TRANSFER_DRIVE_FILE_: JSON.stringify('mk_drive_file'),
			_DATA_TRANSFER_DRIVE_FOLDER_: JSON.stringify('mk_drive_folder'),
			_DATA_TRANSFER_DECK_COLUMN_: JSON.stringify('mk_deck_column'),
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: false,
		},

		build: {
			target: [
				'chrome116',
				'firefox116',
				'safari16',
			],
			manifest: 'manifest.json',
			rollupOptions: {
				output: {
					manualChunks: {
						vue: ['vue'],
						photoswipe: ['photoswipe', 'photoswipe/lightbox', 'photoswipe/style.css'],
					},
					chunkFileNames: process.env.NODE_ENV === 'production' ? '[hash:8].js' : '[name]-[hash:8].js',
					assetFileNames: process.env.NODE_ENV === 'production' ? '[hash:8][extname]' : '[name]-[hash:8][extname]',
				},
			},
			cssCodeSplit: true,
			outDir: __dirname + '/../../built/_client_dist_',
			assetsDir: '.',
			emptyOutDir: false,
			sourcemap: process.env.NODE_ENV === 'development',
			reportCompressedSize: false,
		},

	};
}

const config = defineConfig(({ command, mode }) => getConfig());

export default config;
