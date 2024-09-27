<script lang="ts" setup>
defineProps({
  pkg: {
    type: Object,
    required: true,
  },
})
const formatNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format
</script>

<template>
  <div class="w-full h-full flex flex-col justify-center pl-20 relative bg-gray-100 gap-6">
    <img src="/bg-og.png" class="absolute top-0 -right-40 w-full h-full object-cover opacity-50">
    <div class="text-5xl font-bold">
      <span class="text-amber-500">composer</span><span class="relative -left-2">.chart.dev</span>
    </div>
    <div class="text-7xl font-bold flex items-center p-0">
      {{ pkg.name }}
    </div>
    <div class="font-mono text-5xl text-gray-600 dark:text-gray-400 mt-2">
      {{ formatNumber(pkg.total) }} total Composer downloads
    </div>
  </div>
</template>
