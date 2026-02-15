import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('0.0.0-test')
  },
  esbuild: {
    jsx: 'automatic'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'forks',
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 2
      }
    },
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/e2e/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*'],
      exclude: ['src/**/*.d.ts']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  }
})
