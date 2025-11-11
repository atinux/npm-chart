<script setup lang="ts">

const appConfig = useAppConfig()
const route = useRoute()

const pkgParam = (route.params.pkg as string[]).join('/')
const packagesFromUrl = pkgParam.split('+').map(p => p.trim()).filter(Boolean)

const packagesList = ref<string[]>(packagesFromUrl)
const isCompareMode = ref(packagesFromUrl.length > 1)

const parseColorsFromQuery = (): Record<string, string> => {
  const colorsParam = route.query.colors as string | undefined
  if (!colorsParam) return {}

  try {
    const decoded = atob(colorsParam)
    return JSON.parse(decoded)
  } catch {
    return {}
  }
}

const initialColors = ref<Record<string, string>>(parseColorsFromQuery())

const { data, pending, refresh } = await useFetch(`/api/packages/${packagesList.value.join('+')}`, {
  lazy: true,
  watch: [packagesList],
  default: () => null
})

const packagesData = computed(() => {
  if (!data.value) return []

  if (Array.isArray(data.value)) {
    if (data.value.length === 1) {
      return data.value.map((pkg) => ({
        ...pkg,
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
    ...data.value
  }]
})

const isUpdatingFromUrl = ref(false)

watch(packagesList, async (newPackages: string[]) => {
  if (import.meta.server || isUpdatingFromUrl.value) return

  if (newPackages.length === 0) {
    navigateTo('/')
    return
  }

  const newUrl = `/${newPackages.join('+')}`
  const currentPath = route.path.replace(/^\//, '')
  const newPath = newUrl.replace(/^\//, '')

  if (currentPath !== newPath) {
    await navigateTo(newUrl)
    await refresh()
  }
}, { deep: true })

watch(() => route.params.pkg, (newPkg) => {
  if (import.meta.server) return
  const pkgParam = Array.isArray(newPkg) ? newPkg.join('/') : newPkg
  const newPackages = pkgParam?.split('+').map((p: string) => p.trim()).filter(Boolean) || []
  if (JSON.stringify(newPackages) !== JSON.stringify(packagesList.value)) {
    isUpdatingFromUrl.value = true
    packagesList.value = newPackages
    nextTick(() => {
      isUpdatingFromUrl.value = false
    })
  }
}, { immediate: true })

const handlePackagesChange = (newPackages: string[]) => {
  packagesList.value = newPackages
}

const isUpdatingColors = ref(false)

const handleColorsUpdate = (colors: Record<string, string>) => {
  if (import.meta.server || isUpdatingColors.value) return

  const currentColorsParam = route.query.colors as string | undefined
  let currentColors = {}
  if (currentColorsParam) {
    try {
      currentColors = JSON.parse(atob(currentColorsParam))
    } catch {
      currentColors = {}
    }
  }

  if (JSON.stringify(colors) === JSON.stringify(currentColors)) return

  isUpdatingColors.value = true
  const query = { ...route.query }

  if (Object.keys(colors).length === 0) {
    delete query.colors
  } else {
    query.colors = btoa(JSON.stringify(colors))
  }

  navigateTo({
    path: route.path,
    query
  }, { replace: true }).then(() => {
    nextTick(() => {
      isUpdatingColors.value = false
    })
  }).catch(() => {
    isUpdatingColors.value = false
  })
}

watch(() => route.query.colors, () => {
  if (isUpdatingColors.value) return
  const newColors = parseColorsFromQuery()
  if (JSON.stringify(newColors) !== JSON.stringify(initialColors.value)) {
    initialColors.value = newColors
  }
})

useSeoMeta({
  title: () => {
    if (packagesData.value.length === 1) {
      return `${packagesData.value[0]?.name || packagesList.value[0]} npm downloads - NPM Chart`
    }
    return `${packagesList.value.join(' vs ')} npm downloads - NPM Chart`
  },
  ogTitle: () => {
    if (packagesData.value.length === 1) {
      return `${packagesData.value[0]?.name || packagesList.value[0]} npm downloads`
    }
    return `${packagesList.value.join(' vs ')} npm downloads`
  },
  description: () => {
    if (packagesData.value.length === 1) {
      return packagesData.value[0]?.description || `View ${packagesData.value[0]?.name || packagesList.value[0]} npm download statistics and trends over time.`
    }
    return `Compare npm download statistics for ${packagesList.value.join(', ')}. Visualize trends and compare package popularity over time.`
  },
  ogDescription: () => {
    if (packagesData.value.length === 1) {
      return packagesData.value[0]?.description || `View ${packagesData.value[0]?.name || packagesList.value[0]} npm download statistics and trends over time.`
    }
    return `Compare npm download statistics for ${packagesList.value.join(', ')}. Visualize trends and compare package popularity over time.`
  }
})

if (import.meta.server) {
  if (data.value && packagesList.value.length === 1) {
    defineOgImageComponent('Package', {
      pkg: packagesList.value[0] || '',
    })
  }
  else if (data.value && packagesList.value.length > 1) {
    const ogDescription = `Compare npm download statistics for ${packagesList.value.join(', ')}. Visualize trends and compare package popularity over time.`
    defineOgImageComponent('Packages', {
      packages: packagesList.value,
      description: ogDescription,
    })
  }
  else {
    defineOgImage({
      url: '/og-image.png',
    })
  }
}

defineShortcuts({
  'escape': () => navigateTo('/'),
  '/': () => navigateTo('/'),
  'meta_k': () => navigateTo('/'),
})
</script>

<template>
  <div class="flex flex-col gap-1 w-full md:w-[680px] p-4 lg:p-0">
    <div class="flex justify-between">
      <UTooltip text="Shortcut" :kbds="['meta', 'k']" :content="{ side: 'right' }">
        <UButton
          to="/"
          variant="link"
          color="neutral"
          icon="i-heroicons-magnifying-glass"
          class="opacity-70 hover:opacity-100 px-0"
          size="xs"
        >
          Search another package
        </UButton>
      </UTooltip>
      <ThemePicker />
    </div>

    <div v-if="isCompareMode || packagesData.length > 1" class="mt-2">
      <UFormField label="Packages" description="Add or remove packages to compare">
        <UInputTags
          v-model="packagesList"
          placeholder="Enter package name..."
          @update:model-value="handlePackagesChange"
        />
      </UFormField>
    </div>
    <div v-if="(packagesData.length === 1 || (pending && packagesList.length === 1)) && !isCompareMode">
      <h1 class="text-2xl font-bold">
        <span v-if="pending || data" class="flex items-center gap-1.5">
          <span class="lowercase">{{ packagesData[0]?.name || packagesList[0] }}</span>
          <a
            v-if="packagesData[0]"
            class="text-sm text-dimmed hover:text-muted"
            :href="`https://npmjs.com/package/${packagesData[0].name}`"
            target="_blank"
          >
            v{{ packagesData[0].version }}
          </a>
          <USkeleton v-else-if="pending" class="w-16 h-5" />
        </span>
        <span v-else-if="!pending">Package not found</span>
      </h1>
      <p v-if="packagesData[0]">
        {{ packagesData[0].description }}
      </p>
      <div v-else-if="pending" class="mt-2 space-y-2">
        <USkeleton class="w-full h-4" />
        <USkeleton class="w-5/6 h-4" />
      </div>
      <a
        v-if="packagesData[0]?.homepage"
        :href="packagesData[0].homepage"
        target="_blank"
        class="hover:underline truncate"
        :class="appConfig.theme.blackAsPrimary ? 'text-muted' : 'text-primary'"
      >
        {{ packagesData[0].homepage.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
      </a>
      <USkeleton v-else-if="pending" class="w-48 h-4 mt-2" />
      <div v-if="!pending" class="mt-2">
        <UButton
          size="sm"
          icon="i-heroicons-chart-bar"
          label="Compare with another package"
          @click="isCompareMode = true"
        />
      </div>
    </div>

    <div v-else-if="packagesData.length >= 2 || isCompareMode" class="mt-2">
      <h1 class="text-2xl font-bold">
        <span v-if="packagesData.length >= 2">Comparing {{ packagesData.length }} packages</span>
        <span v-else>Compare packages</span>
      </h1>
      <div class="flex flex-wrap gap-2 mt-2">
        <a
          v-for="pkg in packagesData"
          :key="pkg.name"
          :href="`https://npmjs.com/package/${pkg.name}`"
          target="_blank"
          class="text-sm text-dimmed hover:text-muted"
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
          :initial-colors="initialColors"
          @update:colors="handleColorsUpdate"
        />
        <USkeleton v-else-if="pending" class="w-full h-[468px]" />
        <template #fallback>
          <USkeleton class="w-full h-[468px]" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
