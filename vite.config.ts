import reactPlugin from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Read version from package.json for injection
import * as packageJson from './package.json';

export default defineConfig(({ mode }) => ({
  base: '/NextShift/',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    reactPlugin(),
    // Add bundle analyzer in analyze mode
    mode === 'analyze' &&
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    VitePWA({
      registerType: 'autoUpdate',
      srcDir: 'public',
      filename: 'sw.js',
      strategies: 'injectManifest',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,webmanifest}'],
        manifestTransforms: [
          (manifestEntries) => {
            // Remove duplicate icon entries to prevent cache conflicts
            // Keep all non-icon assets and non-revisioned icon assets
            const manifest = manifestEntries.filter((entry) => {
              const url = entry.url;
              const isIconAsset = url.includes('assets/icons/');

              // Keep all non-icon assets and non-revisioned icon assets
              return !isIconAsset || !entry.revision;
            });
            return { manifest };
          },
        ],
        dontCacheBustURLsMatching: /assets\/icons\/.*\.png$/,
      },
      manifest: {
        name: 'NextShift - Team Shift Tracker',
        short_name: 'NextShift',
        description: 'Team Shift Tracker PWA for 5-team continuous (24/7) schedule',
        theme_color: '#0d6efd',
        background_color: '#ffffff',
        display: 'standalone',
        scope: './',
        start_url: './',
        icons: [
          {
            src: './assets/icons/icon-16.png',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            src: './assets/icons/icon-32.png',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            src: './assets/icons/icon-48.png',
            sizes: '48x48',
            type: 'image/png',
          },
          {
            src: './assets/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: './assets/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: "Today's Schedule",
            short_name: 'Today',
            url: './?tab=today',
            icons: [
              {
                src: './assets/icons/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
          {
            name: 'My Next Shift',
            short_name: 'Next Shift',
            url: './?tab=schedule',
            icons: [
              {
                src: './assets/icons/icon-192.png',
                sizes: '192x192',
              },
            ],
          },
        ],
      },
    }),
  ].filter(Boolean),
  css: {
    transformer: 'lightningcss',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    cssMinify: 'lightningcss',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        toplevel: true,
      },
    },
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      treeshake: {
        preset: 'smallest',
        moduleSideEffects: false,
      },
      output: {
        // Better file organization
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['react-bootstrap', 'bootstrap'],
          'vendor-utils': ['dayjs'],
        },
      },
    },
  },
  server: {
    port: 8000,
    open: true,
    cors: true,
  },
}));
