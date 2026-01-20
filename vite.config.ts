import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  optimizeDeps: {
    include: [
      'protobufjs',
      'protobufjs/minimal'
    ]
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    strictPort: true,
    host: true,
    https: true,
    watch: {
      usePolling: false,
      useFsEvents: false
    },
    hmr: {
      overlay: false
    }
  },
  resolve: {
    alias: {
      'protobufjs/minimal': path.resolve(__dirname, 'node_modules/protobufjs/minimal.js')
    }
  },
  plugins: [
    react(),
    basicSsl(),
    tsconfigPaths(),
    svgrPlugin(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true }
    }),
    {
      name: 'remove-use-client',
      transform(code, id) {
        if (id.includes('@multiversx/sdk-dapp-ui') && code.includes('"use client"')) {
          return {
            code: code.replace('"use client";', '').replace('"use client"', ''),
            map: null
          };
        }
      }
    }
  ],
  build: {
    outDir: 'build',
    sourcemap: false,
    commonjsOptions: {
      include: [
        /node_modules/,
        /node_modules\/protobufjs\/.*/,
        'protobufjs',
        'protobufjs/minimal'
      ]
    }
  },
  preview: {
    port: 3002,
    https: true,
    host: 'localhost',
    strictPort: true
  }
});
