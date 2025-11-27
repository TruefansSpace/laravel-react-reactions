import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'workbench/resources/js'),
            'package': resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        outDir: 'workbench/public/build',
        manifest: true,
        rollupOptions: {
            input: 'workbench/resources/js/app.jsx',
        },
    },
    server: {
        hmr: {
            host: 'localhost',
        },
    },
});
