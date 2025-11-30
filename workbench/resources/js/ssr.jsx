import { createInertiaApp } from '@inertiajs/react'
import createServer from '@inertiajs/react/server'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import ReactDOMServer from 'react-dom/server'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

createServer((page) => {
  console.log('SSR Request:', JSON.stringify(page));
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
      const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
      const page = pages[`./Pages/${name}.jsx`];
      if (!page) {
        console.error(`Page not found: ./Pages/${name}.jsx`);
        throw new Error(`Page not found: ./Pages/${name}.jsx`);
      }
      return page;
    },
    defaults: {
        future: {
            useDialogForErrorModal: true,
        },
    },
    setup: ({ App, props }) => <App {...props} />,
  });
})
