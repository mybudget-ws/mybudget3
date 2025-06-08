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
  app: {
    // https://nuxt.com/docs/getting-started/seo-meta
    head: {
      title: 'myBudget',
      htmlAttrs: {
        lang: 'ru',
        'data-bs-theme': 'dark',
      },
      link: [
        {
          rel: 'stylesheet',
          href: '/tabler.min.css',
        }
      ],
      script: [
        {
          src: "/tabler.min.js",
          async: true,
        },
      ],
    },
    baseURL: '/',
  },
  ssr: true,
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
