import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    projects: [
      {
        resolve: {
          alias: { '@': resolve(__dirname, './src') },
        },
        test: {
          name: 'unit',
          include: ['tests/appointments/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: { '@': resolve(__dirname, './src') },
        },
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          env: { NODE_ENV: 'test' },
          sequence: { concurrent: false },
        },
      },
    ],
  },
})
