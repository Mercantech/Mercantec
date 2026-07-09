import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const authBaseUrl = process.env.PUBLIC_AUTH_BASE_URL ?? 'https://auth.mercantec.tech';

export default defineConfig({
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api/oauth': {
          target: authBaseUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/oauth/, '/oauth'),
        },
      },
    },
    preview: {
      proxy: {
        '/api/oauth': {
          target: authBaseUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/oauth/, '/oauth'),
        },
      },
    },
  },
  site: 'https://mercantec.tech',
});
