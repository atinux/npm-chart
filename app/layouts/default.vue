<template>
  <div class="flex flex-col items-center sm:justify-center sm:h-screen mx-auto">
    <slot />
    <footer class="flex items-center justify-center bottom-0 w-full text-sm text-gray-500 px-6 pb-6" :class="$route.path === '/' ? 'fixed' : 'sm:fixed mt-6'">
      <p class="text-center">
        Made by <a href="https://x.com/atinux" target="_blank">Atinux</a><span class="inline-block mx-1.5">&middot;</span>Deployed on <a href="https://hub.nuxt.com/?utm_source=npm-chart">NuxtHub</a><span class="inline-block mx-1.5">&middot;</span>Source code on <a href="https://github.com/atinux/npm-chart" target="_blank">GitHub</a>
      </p>
    </footer>
  </div>
</template>
