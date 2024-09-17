<script setup lang="ts">
const pkg = ref('')
const loading = ref(false)
const packages = ['vue', 'react', 'svelte', 'angular', 'next', 'nuxt', 'astro', 'supabase', 'lodash', 'date-fns', 'express', 'h3', 'nitropack', 'typescript', 'vite']
// Get 4 random packages
const randomPackages = useState('pkgs', () => {
  const clone = packages.slice()
  return clone.sort(() => 0.5 - Math.random()).slice(0, 4)
})
function goToPackage(pkg: string) {
  loading.value = true
  navigateTo(`/${pkg}`)
}
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold uppercase">
      NPM Chart
    </h1>
    <form class="flex gap-1 mt-4" @submit.prevent="goToPackage(pkg)">
      <UInput v-model="pkg" placeholder="npm package" autofocus />
      <UButton icon="i-heroicons-magnifying-glass" :disabled="!pkg" :loading="loading" />
    </form>
    <div class="flex gap-1 mt-2">
      <UButton
        v-for="pkg in randomPackages"
        :key="pkg"
        :to="`/${pkg}`"
        @click="goToPackage(pkg)"
        color="gray"
        :label="pkg"
        size="xs"
      />
    </div>
  </div>
</template>
