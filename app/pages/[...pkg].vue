<script setup lang="ts">
const pkg = useRoute().params.pkg.join('/')
const { data, pending } = await useFetch(`/api/${pkg}`, {
  lazy: import.meta.client,
})
useSeoMeta({
  title: () => `${data.value?.name || pkg} npm downloads - NPM Chart`,
  ogTitle: () => `${data.value?.name || pkg} npm downloads`,
  description: () => data.value?.description || '',
})
if (import.meta.server) {
  if (data.value) {
    defineOgImageComponent('Package', {
      pkg: data,
    })
  }
  else {
    useSeoMeta({
      ogImage: '/og-image.png',
    })
  }
}
defineShortcuts({
  escape: () => navigateTo('/'),
})
</script>

<template>
  <div class="flex flex-col gap-1 w-full md:w-[680px] p-4 lg:p-0">
    <div class="flex justify-between">
      <UTooltip text="Shortcut" :shortcuts="['esc']" :popper="{ placement: 'right' }">
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
    <h1 class="text-2xl font-bold">
      <span v-if="data || pending" class="flex items-baseline gap-1.5">
        <span class="lowercase">{{ data?.name || pkg }}</span>
        <a
          v-if="data"
          class="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
          :href="`https://npmjs.com/package/${data.name}`"
          target="_blank"
        >
          v{{ data.version }}
        </a>
        <USkeleton v-else-if="pending" class="w-20 h-4" />
      </span>
      <span v-else>Package not found</span>
    </h1>
    <p v-if="data">
      {{ data.description }}
    </p>
    <USkeleton v-else-if="pending" class="w-full h-4 mt-2" />
    <a
      v-if="data?.homepage"
      :href="data.homepage"
      target="_blank"
      class="text-primary hover:underline"
    >
      {{ data.homepage.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
    </a>
    <USkeleton v-else-if="pending" class="w-full h-4 mt-2" />

    <div v-if="pending || data" class="mt-4">
      <ClientOnly>
        <NPMChart v-if="data" :data="data.downloads" :total="data.total" />
        <USkeleton v-else-if="pending" class="w-full h-[412px]" />
        <template #fallback>
          <USkeleton class="w-full h-[425px]" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
