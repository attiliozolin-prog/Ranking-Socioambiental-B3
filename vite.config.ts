import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// v1 injetava GEMINI_API_KEY no bundle do navegador via `define`, expondo a
// chave a qualquer visitante. O app não usa IA no cliente; nenhuma variável
// de ambiente secreta deve ser referenciada aqui.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3000 },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
