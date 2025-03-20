<script setup lang="ts">
const packages = (useRoute().params.pkg as string[]).join('/').split(',')
const { data, pending } = await useAsyncData(async () => {
  if (packages.length === 0) {
    return []
  }
  return Promise.all(packages.map(pkg => $fetch(`/api/packages/${pkg}`)))
})

const downloadData = computed(() => {
  if (!data.value) return {}
  const result: PackageDownloadsByDate = {}
  data.value.forEach((pkg) => {
    for (const date in pkg.downloads) {
      result[date] ||= Object.fromEntries(packages.map(pkg => [pkg, 0]))
      if(pkg.downloads[date]) {
        result[date][pkg.name] = pkg.downloads[date]
      }
    }
  })

  return result
})

const title = computed(() => `${data.value?.map(d => d.name).join(', ') || packages} npm downloads - NPM Chart`)

useSeoMeta({
  title,
  ogTitle: () => `${data.value?.map(d => d.name).join(', ')|| packages} npm downloads`,
  description: () => (data.value?.length ?? 0) > 1 ? 'Compare the NPM downloads of ' + data.value?.map(d => d.name).join(', ') : data.value?.[0]?.description ?? '',
})

defineShortcuts({
  'escape': () => navigateTo('/'),
  '/': () => navigateTo('/'),
  'meta_k': () => navigateTo('/'),
})


if (import.meta.server) {
  if (data.value) {
    defineOgImageComponent('Package', {
      packages,
    })
  }
  else {
    defineOgImage({
      url: '/og-image.png',
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-1 w-full md:w-[680px] p-4 lg:p-0">
    <div class="flex justify-between">
      <UTooltip text="Shortcut" :shortcuts="['/']" :popper="{ placement: 'right' }">
        <UButton
          to="/"
          variant="link"
          :padded="false"
          color="gray"
          icon="i-heroicons-magnifying-glass"
          class="opacity-70 hover:opacity-100"
          size="xs"
        >
          Search another package
        </UButton>
      </UTooltip>
      <ColorPicker />
    </div>
    <template v-if="data || pending">
      <h1 class="text-2xl font-bold">
      <span class="flex flex-wrap items-baseline gap-1.5">
        <template v-if="data">
        <template v-for="(packageData, idx) in data" :key="packageData.name">
          <span class="lowercase">{{ packageData.name }}</span>
          <a
          class="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
          :href="`https://npmjs.com/package/${packageData.name}`"
          target="_blank"
          >
          v{{ packageData.version }}
          </a>
          <span v-if="idx < data.length - 1" class="text-gray-400 mx-1">vs</span>
        </template>
        </template>
        <USkeleton v-else-if="pending" class="w-20 h-4" />
      </span>
      </h1>
      
      <div v-if="data" class="space-y-2">
      <div v-for="packageData in data" :key="packageData.name" class="border-b border-gray-100 dark:border-gray-800 pb-2">
        <p>{{ packageData.description }}</p>
        <a
        v-if="packageData.homepage"
        :href="packageData.homepage"
        target="_blank"
        class="text-primary hover:underline truncate block"
        >
        {{ packageData.homepage.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
        </a>
      </div>
      </div>
      <template v-else-if="pending">
        <USkeleton class="w-full h-4 mt-2" />
        <USkeleton class="w-full h-4 mt-2" />
      </template>
    </template>
    <h1 v-else class="text-2xl font-bold">Packages not found</h1>

    <div v-if="pending || data" class="mt-4">
      <ClientOnly>
        <NPMChart
          v-if="data"
          :pkg="data.map(d => d.name)"
          :data="downloadData"
          :total="data.map(d => d.total)"
        />
        <USkeleton v-else-if="pending" class="w-full h-[468px]" />
        <template #fallback>
          <USkeleton class="w-full h-[468px]" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
