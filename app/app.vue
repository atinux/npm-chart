<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en',
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
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
    <footer class="flex items-center justify-center bottom-6 w-full text-sm text-gray-500 px-10" :class="$route.path === '/' ? 'fixed' : 'sm:fixed mt-6'">
      <p class="text-center">
        Made by <a href="https://x.com/atinux" target="_blank">Atinux</a>
        <span class="mx-1">&middot;</span>
        Deployed on <a href="https://hub.nuxt.com/?utm_source=npm-chart">NuxtHub</a>
        <span class="mx-1">&middot;</span>
        Source code on <a href="https://github.com/atinux/npm-chart" target="_blank">GitHub</a>
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
  @apply text-gray-400 hover:underline underline-offset-4 dark:hover:text-white hover:text-gray-900;
}
</style>
