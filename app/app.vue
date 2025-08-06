<script setup lang="ts">
import colors from 'tailwindcss/colors'

const appConfig = useAppConfig()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? (colors as any)[appConfig.ui.colors.neutral][900] : 'white')
const blackAsPrimary = computed(() => appConfig.theme.blackAsPrimary ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }` : ':root {}')

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
    { name: 'google-site-verification', content: 'YuBf6_cS6BEqCqFpYg8txaJvOjLFoVTv7TK4gUG_S2Q' },
  ],
  style: [
    { innerHTML: blackAsPrimary, id: 'nuxt-ui-black-as-primary', tagPriority: -2 }
  ],
})
useSeoMeta({
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <UApp :tooltip="{ delayDuration: 0 }">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="rgb(var(--color-primary-DEFAULT))" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
