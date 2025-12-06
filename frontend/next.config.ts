import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages that should not be bundled
  serverExternalPackages: ['pino', 'pino-pretty'],
  
  // Turbopack configuration to ignore test files
  turbopack: {
    rules: {
      '*.test.{js,mjs,ts}': {
        loaders: ['ignore-loader'],
      },
      '**/test/**': {
        loaders: ['ignore-loader'],
      },
      '**/bench.js': {
        loaders: ['ignore-loader'],
      },
      '**/*.md': {
        loaders: ['ignore-loader'],
      },
    },
  },
};

export default nextConfig;
