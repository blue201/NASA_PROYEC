import { defineConfig } from 'vite';

// base relativa para que funcione en GitHub Pages bajo /<repo>/
// es2022 para permitir top-level await en main.js
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
});
