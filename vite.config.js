import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['workbench/resources/css/app.css', 'workbench/resources/js/app.tsx'],
            ssr: 'workbench/resources/js/ssr.tsx',
            refresh: true,
            publicDirectory: 'workbench/public',
        }),
        react(),
        tailwindcss(),
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
    },
    server: {
        hmr: {
            host: 'localhost',
        },
    },
});
