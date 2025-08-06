<template>
  <div class="w-full h-full">
    <div class="flex flex-col items-center sm:justify-center sm:h-screen mx-auto px-10 py-5">
      <slot />
      <footer class="flex flex-col items-center justify-center bottom-0 w-full text-sm font-semibold text-neutral-500 px-6 pb-3">
        <p>
          <a href="https://npm.chart.dev" target="_blank" class="flex items-center gap-1">
            <img src="/favicon.ico" class="w-4 h-4" alt="">
            npm.chart.dev
          </a>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}
</style>
