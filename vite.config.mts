import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { fileURLToPath } from 'url';
import Sitemap from 'vite-plugin-sitemap';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to fetch dynamic routes (Market IDs)
const getDynamicRoutes = async () => {
    const env = loadEnv('production', process.cwd(), '');
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return [];

    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
    const { data } = await supabase.from('markets_metadata').select('market_id');
    return (data || []).map(m => `/market/${m.market_id}`);
};

export default defineConfig(async ({ mode }) => {
    const dynamicRoutes = await getDynamicRoutes();

    return {
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
            },
            Sitemap({
                hostname: 'https://xpeep.app',
                dynamicRoutes,
                exclude: ['/admin', '/404'],
                outDir: 'build'
            })
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
    };
});
