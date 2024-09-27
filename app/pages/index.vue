<script setup lang="ts">
const pkg = ref('')
const loading = ref(false)
const packages = ['laravel/framework', 'symfony/symfony', 'guzzlehttp/guzzle', 'phpunit/phpunit', 'doctrine/orm', 'twig/twig', 'monolog/monolog', 'league/flysystem', 'nikic/php-parser', 'egulias/email-validator']
const randomPackages = useState('pkgs', () => {
  const clone = packages.slice()
  return clone.sort(() => 0.5 - Math.random()).slice(0, 4)
})
function goToPackage(pkg: string) {
  loading.value = true
  navigateTo(`/${pkg.trim()}`)
}
useSeoMeta({
  title: 'Composer Chart',
  ogTitle: 'Composer Chart',
  description: 'Visualize Composer package downloads in a beautiful chart, ready to be shared with your community.',
  ogImage: 'https://composer.chart.dev/og-image.png',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold uppercase">
      Composer Chart
    </h1>
    <p class="text-sm text-gray-500 mt-1 text-center px-6 sm:px-0">
      Search for a Composer package to see its download stats over time.
    </p>
    <form class="flex gap-1 mt-4" @submit.prevent="goToPackage(pkg)">
      <UInput
        v-model="pkg"
        size="lg"
        placeholder="Composer package"
        autofocus
        :ui="{
          trailing: { padding: { lg: 'pr-13' } },
          icon: { trailing: { pointer: '', padding: { lg: 'pr-1' } } }
        }">
        <template #trailing>
          <UButton type="submit" icon="i-heroicons-magnifying-glass" :disabled="!pkg" :loading="loading" aria-label="Search" />
        </template>
      </UInput>
    </form>
    <div class="flex flex-wrap justify-center gap-1 mt-3">
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
