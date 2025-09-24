import path from 'path'
import { loadEnv } from 'payload/node'
import { fileURLToPath } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default defineConfig(() => {
  loadEnv(path.resolve(dirname, './dev'))

  return {
    plugins: [
      tsconfigPaths({
        ignoreConfigErrors: true,
      }),
    ],
    test: {
      environment: 'jsdom',
      hookTimeout: 30_000,
      testTimeout: 30_000,
      setupFiles: ['./src/__tests__/setup.ts'],
      globals: true,
      exclude: ['**/node_modules/**', '**/dist/**', '**/dev/e2e.spec.ts'],
    },
    transform: {
      '^.+\\.css$': 'jest-transform-stub',
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    assetsInclude: ['**/*.css'],
    define: {
      'import.meta.vitest': 'undefined',
    },
    esbuild: {
      target: 'node14',
    },
  }
})
