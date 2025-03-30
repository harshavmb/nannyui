
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Environment variables with defaults for different environments
const getEnvironmentVariables = (mode) => {
  // Common variables across all environments
  const common = {
    'process.env': {}
  };

  // Development-specific variables
  const development = {
    'VITE_API_URL': JSON.stringify('http://localhost:8080'),
    'VITE_ENV': JSON.stringify('development')
  };

  // Production-specific variables
  const production = {
    'VITE_API_URL': JSON.stringify('https://api.nannyai.com'),
    'VITE_ENV': JSON.stringify('production')
  };

  // Testing-specific variables
  const test = {
    'VITE_API_URL': JSON.stringify('http://localhost:8080'),
    'VITE_ENV': JSON.stringify('test')
  };

  // Select environment variables based on mode
  const envVars = mode === 'production' 
    ? { ...common, ...production }
    : mode === 'test' 
      ? { ...common, ...test }
      : { ...common, ...development };

  return envVars;
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: getEnvironmentVariables(mode),
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ],
    },
  }
}));
