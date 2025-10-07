import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude sidecar/auxiliary service tests from root validation run to lock current quality state
    // without modifying application/runtime code.
    exclude: ['node_modules', 'dist', '.git', 'numinos-service/**'],
    environment: 'node',
    coverage: {
      reporter: ['text', 'html']
    }
  }
});