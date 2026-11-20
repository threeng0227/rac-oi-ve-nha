import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    reportCompressedSize: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
