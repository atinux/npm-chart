<script setup lang="ts">
const pkg = ref('')
const packages = ['vue', 'react', 'svelte', 'angular', 'next', 'nuxt', 'astro', 'supabase', 'lodash', 'date-fns', 'express', 'h3', 'nitropack', 'typescript', 'vite']
// Get 4 random packages
const randomPackages = useState('pkgs', () => {
  const clone = packages.slice()
  return clone.sort(() => 0.5 - Math.random()).slice(0, 4)
})
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold uppercase">
      NPM Chart
    </h1>
    <form class="flex gap-1 mt-4" @submit.prevent="$router.push(`/${pkg}`)">
      <UInput v-model="pkg" placeholder="npm package" autofocus />
      <UButton icon="i-heroicons-magnifying-glass" :disabled="!pkg" />
    </form>
    <div class="flex gap-1 mt-2">
      <UButton
        v-for="pkg in randomPackages"
        :key="pkg"
        :to="`/${pkg}`"
        color="gray"
        :label="pkg"
        size="xs"
      />
    </div>
  </div>
</template>
