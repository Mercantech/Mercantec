import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const authBaseUrl = process.env.PUBLIC_AUTH_BASE_URL ?? 'https://auth.mercantec.tech';
const studentsApiUrl = process.env.STUDENTS_API_DEV_URL ?? 'http://localhost:4041';

const studentsApiProxy = {
  target: studentsApiUrl,
  changeOrigin: true,
};

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
        '/api/student-projects': studentsApiProxy,
        '/api/admin/student-projects': studentsApiProxy,
        '/media': {
          target: process.env.MINIO_DEV_URL ?? 'http://localhost:9000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/media/, '/student-projects'),
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
        '/api/student-projects': studentsApiProxy,
        '/api/admin/student-projects': studentsApiProxy,
        '/media': {
          target: process.env.MINIO_DEV_URL ?? 'http://localhost:9000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/media/, '/student-projects'),
        },
      },
    },
  },
  site: 'https://mercantec.tech',
});
