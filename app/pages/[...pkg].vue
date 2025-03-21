<script setup lang="ts">
import colors from '#tailwind-config/theme/colors'

const route = useRoute()
const router = useRouter()
const packages = ref((route.params.pkg as string[]).join('/').split(','))
const newPackage = ref('')

const { data, pending } = await useAsyncData(async () => {
  if (packages.value.length === 0) {
    return []
  }
  return Promise.all(packages.value.map(pkg => $fetch(`/api/packages/${pkg}`)))
})

function addPackage() {
  if (!newPackage.value.trim() || packages.value.length >= 10) return
  packages.value.push(newPackage.value.trim())
  newPackage.value = ''
  navigateToPackages()
}

function removePackage(index: number) {
  packages.value.splice(index, 1)
  if (packages.value.length === 0) {
    navigateTo('/')
  } else {
    navigateToPackages()
  }
}

function navigateToPackages() {
  router.push(`/${packages.value.join(',')}`)
}

const downloadData = computed(() => {
  if (!data.value) return {}
  const result: PackageDownloadsByDate = {}
  data.value.forEach((pkg) => {
    for (const date in pkg.downloads) {
      result[date] ||= Object.fromEntries(packages.value.map(pkg => [pkg, 0]))
      if(pkg.downloads[date]) {
        result[date][pkg.name] = pkg.downloads[date]
      }
    }
  })

  return result
})


const appConfig = useAppConfig()
const colorMode = useColorMode()

const pickedColors = ref<string[]>(Array.from({ length: packages.value.length }, (_, i) => {
  const colorName = appConfig.ui.colors[i % appConfig.ui.colors.length] as keyof typeof colors
  return colors[colorName][colorMode.value === 'dark' ? 400 : 500]
}))

// Reuse the primary colors from the app configuration
const colorOptions = computed(() => 
  [...appConfig.ui.colors, 'neutral']
    .filter(color => color !== 'primary')
    .map(colorName => colors[colorName as keyof typeof colors][colorMode.value === 'dark' ? 400 : 500])
)

// Function to update a package color
const updatePackageColor = (packageIndex: number, newColor: string) => {
  pickedColors.value[packageIndex] = newColor
}

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
    <div class="flex flex-wrap justify-between items-center gap-2">
      <form class="flex gap-1" @submit.prevent="addPackage">
        <UInput
          v-model="newPackage"
          size="xs"
          placeholder="Add package"
          :disabled="(data?.length ?? 0) >= 10"
        >
          <template #trailing>
            <UButton 
              type="submit"
              color="gray"
              variant="ghost"
              icon="i-heroicons-plus-small"
              size="xs"
              :disabled="!newPackage || (data?.length ?? 0) >= 10"
            />
          </template>
        </UInput>
      </form>
      <ColorPicker />
    </div>

    <template v-if="data || pending">
      <h1 class="text-2xl font-bold mb-4">Compare NPM Packages</h1>
      <div class="flex flex-col gap-0.5">
        <template v-if="data">
          <div v-for="(packageData, idx) in data" :key="packageData.name" 
            class="flex items-center justify-between py-1 px-2 rounded-lg border border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-2">
              <div class="w-[150px] flex items-center gap-2">
                <UPopover>
                  <template #default="{ open }">
                    <button
                      class="lowercase inline-flex items-center cursor-pointer focus:outline-none truncate max-w-[140px]"
                      :class="{ 'text-primary-500': open }"
                      :title="packageData.name"
                    >
                      <span class="inline-block w-3 h-3 rounded-full mr-1 flex-shrink-0" :style="{ backgroundColor: pickedColors[idx] }"></span>
                      <span class="font-medium truncate">{{ packageData.name }}</span>
                    </button>
                  </template>
                  <template #panel>
                    <div class="p-2">
                      <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Pick a color for {{ packageData.name }}</div>
                      <div class="grid grid-cols-5 gap-1">
                        <button
                          v-for="(color, colorIdx) in colorOptions"
                          :key="colorIdx"
                          class="w-6 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 hover:scale-110 transition-transform"
                          :style="{ backgroundColor: color }"
                          :class="{ 'ring-2 ring-gray-500': color === pickedColors[idx] }"
                          @click="updatePackageColor(idx, color)"
                        />
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 flex-1">{{ packageData.description }}</p>
            </div>
            <div class="flex items-center gap-2">
              <UTooltip text="View on npm">
                <a
                  class="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                  :href="`https://npmjs.com/package/${packageData.name}`"
                  target="_blank"
                >
                  <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
                </a>
              </UTooltip>
              <UButton
                icon="i-heroicons-x-mark"
                size="xs"
                color="gray"
                variant="ghost"
                @click="removePackage(idx)"
              />
            </div>
          </div>
        </template>
        <USkeleton v-else-if="pending" class="w-full h-20" />
      </div>
    </template>
    
    <div v-if="pending || data" class="mt-4">
      <ClientOnly>
        <NPMChart
          v-if="data"
          :pkg="data.map(d => d.name)"
          :data="downloadData"
          :total="data.map(d => d.total)"
          :colors="pickedColors"
        />
        <USkeleton v-else-if="pending" class="w-full h-[468px]" />
        <template #fallback>
          <USkeleton class="w-full h-[468px]" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
