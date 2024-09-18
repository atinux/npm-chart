<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en',
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
    { name: 'google-site-verification', content: 'YuBf6_cS6BEqCqFpYg8txaJvOjLFoVTv7TK4gUG_S2Q' },
  ],
})
useSeoMeta({
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator color="rgb(var(--color-primary-DEFAULT))" />
  <div class="flex flex-col items-center sm:justify-center sm:h-screen mx-auto">
    <NuxtPage />
    <footer class="flex items-center justify-center bottom-0 w-full text-sm text-gray-500 px-6 pb-6" :class="$route.path === '/' ? 'fixed' : 'sm:fixed mt-6'">
      <p class="text-center">
        Made by <a href="https://x.com/atinux" target="_blank">Atinux</a><span class="inline-block mx-1.5">&middot;</span>Deployed on <a href="https://hub.nuxt.com/?utm_source=npm-chart">NuxtHub</a><span class="inline-block mx-1.5">&middot;</span>Source code on <a href="https://github.com/atinux/npm-chart" target="_blank">GitHub</a>
      </p>
    </footer>
  </div>
</template>

<style lang="postcss">
.light {
  @apply bg-gray-100 text-gray-900;
}
.dark {
  @apply bg-gray-950 text-gray-50;
}

footer a {
  @apply text-gray-700 dark:text-gray-300 hover:underline underline-offset-4 dark:hover:text-white hover:text-gray-900;
}
</style>
