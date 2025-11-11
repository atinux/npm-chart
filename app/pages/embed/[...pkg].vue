<script setup lang="ts">
import { setResponseHeaders } from 'h3'

definePageMeta({
  layout: 'embed',
})

const route = useRoute()
const pkgParam = (route.params.pkg as string[]).join('/')
const packagesFromUrl = pkgParam.split('+').map((p: string) => p.trim()).filter(Boolean)

const { data, pending } = await useFetch(`/api/packages/${packagesFromUrl.join('+')}`, {
  lazy: import.meta.client,
})

const packagesData = computed(() => {
  if (!data.value) return []

  if (Array.isArray(data.value)) {
    if (data.value.length === 1) {
      return data.value.map((pkg) => ({
        ...pkg,
        color: 'var(--ui-primary)'
      }))
    }

    const usedColors = new Set<string>()
    return data.value.map((pkg, index: number) => {
      let assignedColor = getColorForPackage(index)
      let colorIndex = index
      while (usedColors.has(assignedColor) && colorIndex < 100) {
        colorIndex++
        assignedColor = getColorForPackage(colorIndex)
      }
      usedColors.add(assignedColor)

      return {
        ...pkg,
        color: assignedColor
      }
    })
  }

  return [{
    ...data.value,
    color: 'var(--ui-primary)'
  }]
})

if (import.meta.server) {
  setResponseHeaders(useRequestEvent()!, {
    'X-Frame-Options': 'ALLOW-FROM *',
    'Content-Security-Policy': 'frame-ancestors *',
  })
}

useSeoMeta({
  title: () => {
    if (packagesData.value.length === 1) {
      return `${packagesData.value[0]?.name || packagesFromUrl[0]} npm downloads - NPM Chart`
    }
    return `${packagesFromUrl.join(' + ')} npm downloads - NPM Chart`
  },
  description: () => {
    if (packagesData.value.length === 1) {
      return packagesData.value[0]?.description || `View ${packagesData.value[0]?.name || packagesFromUrl[0]} npm download statistics and trends over time.`
    }
    return `Compare npm download statistics for ${packagesFromUrl.join(', ')}. Visualize trends and compare package popularity over time.`
  },
})
</script>

<template>
  <div class="w-full h-full">
    <div v-if="packagesData.length === 1">
      <h1 class="text-2xl font-bold">
        <span v-if="data || pending" class="flex items-baseline gap-1.5">
          <span class="lowercase">{{ packagesData[0]?.name || packagesFromUrl[0] }}</span>
          <a
            v-if="packagesData[0]"
            class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400"
            :href="`https://npmjs.com/package/${packagesData[0].name}`"
            target="_blank"
          >
            v{{ packagesData[0].version }}
          </a>
          <USkeleton v-else-if="pending" class="w-20 h-4" />
        </span>
        <span v-else>Package not found</span>
      </h1>
      <p v-if="packagesData[0]">
        {{ packagesData[0].description }}
      </p>
      <USkeleton v-else-if="pending" class="w-full h-4 mt-2" />
      <a
        v-if="packagesData[0]?.homepage"
        :href="packagesData[0].homepage"
        target="_blank"
        class="text-primary hover:underline truncate"
      >
        {{ packagesData[0].homepage.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
      </a>
      <USkeleton v-else-if="pending" class="w-full h-4 mt-2" />
    </div>

    <div v-else-if="packagesData.length > 1">
      <h1 class="text-2xl font-bold">
        Comparing {{ packagesData.length }} packages
      </h1>
      <div class="flex flex-wrap gap-2 mt-2">
        <a
          v-for="pkg in packagesData"
          :key="pkg.name"
          :href="`https://npmjs.com/package/${pkg.name}`"
          target="_blank"
          class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400"
        >
          {{ pkg.name }}<span v-if="pkg.version">@{{ pkg.version }}</span>
        </a>
      </div>
    </div>

    <div v-if="pending || data" class="mt-4">
      <ClientOnly>
        <NPMChart
          v-if="packagesData.length > 0"
          :packages="packagesData"
        />
        <USkeleton v-else-if="pending" class="w-full h-[468px]" />
        <template #fallback>
          <USkeleton class="w-full h-[468px]" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
