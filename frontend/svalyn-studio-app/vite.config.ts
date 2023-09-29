import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';

const commitHash = execSync('git rev-parse HEAD').toString();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __GIT_COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [react()],
});
