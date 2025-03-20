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
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
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
