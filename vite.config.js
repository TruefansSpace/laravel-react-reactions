import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['workbench/resources/css/app.css', 'workbench/resources/js/app.jsx'],
            refresh: true,
            publicDirectory: 'workbench/public',
        }),
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
