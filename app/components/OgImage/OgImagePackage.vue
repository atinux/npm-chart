<script lang="ts" setup>
defineProps({
  pkg: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="w-full h-full flex flex-col justify-center pl-12">
    <h1 class="text-8xl font-bold flex items-center gap-1">
      <span>{{ pkg.name }}</span>
      <span
        class="text-4xl"
        style="color: #666;"
      >
        v{{ pkg.version }}
      </span>
    </h1>
    <p class="text-4xl">
      {{ pkg.description }}
    </p>
    <span
      v-if="pkg.homepage"
      class="text-2xl text-orange-400"
    >
      {{ pkg.homepage.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
    </span>
  </div>
</template>
