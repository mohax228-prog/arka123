import { defineConfig } from 'vite';

// base './' — чтобы сайт работал из подпапки на GitHub Pages.
// target — поддержка браузеров примерно с 2020 года (в т.ч. старых iPhone на iOS 14+).
export default defineConfig({
  base: './',
  build: { target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'] },
});
