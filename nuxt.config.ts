// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-30',
  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: { compatibilityVersion: 4 },

  // https://nuxt.com/modules
  modules: ['@nuxthub/core', '@nuxt/eslint', '@nuxt/ui', '@nuxt/fonts', '@vueuse/nuxt', '@nuxtjs/plausible', 'nuxt-og-image'],

  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    // https://hub.nuxt.com/docs/features/cache
    cache: true
  },

  nitro: {
    unenv: {
      external: ['node:process']
    }
  },

  icon: {
    clientBundle: {
      scan: true
    },
  },

  // https://eslint.nuxt.com
  eslint: {
    config: {
      stylistic: {
        quotes: 'single'
      }
    }
  },

  // https://devtools.nuxt.com
  devtools: { enabled: false }
})