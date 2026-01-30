// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  
  app: {
    head: {
      meta: [
        { name: 'application-name', content: 'GROMKA.show' },
        { name: 'theme-color', content: '#ffffff' }
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap'
        },

        // Favicons / PWA
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon/web-app-manifest-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon/web-app-manifest-512x512.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' }
      ]
    }
  }
})
