<script setup lang="ts">
import { setResponseHeaders } from 'h3'

definePageMeta({
  layout: 'embed',
})

const pkg = useRoute().params.pkg.join('/')
const { data, pending } = await useFetch(`/api/${pkg}`, {
  lazy: import.meta.client,
})

if (import.meta.server) {
  setResponseHeaders(useRequestEvent(), {
    'X-Frame-Options': 'ALLOW-FROM *',
    'Content-Security-Policy': 'frame-ancestors *',
  })
}

useSeoMeta({
  title: () => `${data.value?.name || pkg} npm downloads - NPM Chart`,
})
</script>

<template>
  <div class="w-full h-full">
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
      class="text-primary hover:underline truncate"
    >
      {{ data.homepage.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
    </a>
    <USkeleton v-else-if="pending" class="w-full h-4 mt-2" />

    <div v-if="pending || data" class="mt-4">
      <ClientOnly>
        <NPMChart
          v-if="data"
          :pkg="data.name"
          :data="data.downloads"
          :total="data.total"
        />
        <USkeleton v-else-if="pending" class="w-full h-[468px]" />
        <template #fallback>
          <USkeleton class="w-full h-[468px]" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
