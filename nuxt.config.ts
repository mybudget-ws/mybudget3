// nuxt.config.ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/sitemap',
    '@nuxt/eslint',
  ],
  // css: [
  //   "~/assets/main.css",
  // ],
  plugins: [{ src: '~/plugins/tabler.client.ts', mode: 'client' }],
  app: {
    head: {
      title: 'myBudget',
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: '/tabler.min.css',
        },
        {
          rel: 'stylesheet',
          href: '/tabler-themes.css',
        }
      ],
      script: [
        {
          // src: "/tabler.min.js",
          // defer: true
        }
      ]
    },
    baseURL: '/',
  },
  ssr: false, // true
  experimental: {
    defaults: {
      // https://nuxt.com/docs/api/components/nuxt-link#in-nuxt-config
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
  },
  site: {
    url: "https://3.mybudget.ws",
    trailingSlash: true,
  },
  // https://nuxtseo.com/docs/sitemap/api/config
  // https://github.com/nuxt-modules/sitemap/blob/main/src/runtime/types.ts
  sitemap: {
    xsl: false,
  },
})
