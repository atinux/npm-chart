<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  backgroundType: 'solid' | 'dotted'
  chartMode: 'area' | 'line'
  lineWidth: number
  packages: Array<{ name: string; color: string }>
  customColors: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:backgroundType': [value: 'solid' | 'dotted']
  'update:chartMode': [value: 'area' | 'line']
  'update:lineWidth': [value: number]
  'update:customColors': [value: Record<string, string>]
}>()

const colorRefs = ref<Record<string, string>>({})
const hexInputRefs = ref<Record<string, string>>({})

const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match?.[1] || !match?.[2] || !match?.[3]) return '#000000'

  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${[match[1], match[2], match[3]].map(n => toHex(parseInt(n, 10))).join('')}`
}

const cssColorToHex = (color: string): string => {
  if (!import.meta.client) return '#000000'

  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (!ctx) return '#000000'

    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)

    const data = ctx.getImageData(0, 0, 1, 1).data
    const toHex = (n: number) => n.toString(16).padStart(2, '0')

    return `#${toHex(data[0] ?? 0)}${toHex(data[1] ?? 0)}${toHex(data[2] ?? 0)}`
  } catch {
    return '#000000'
  }
}

const resolveColor = (color: string): string => {
  if (!color) return '#000000'

  if (color.startsWith('#')) {
    if (color.length === 7) return color
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
    }
    return '#000000'
  }

  if (color.startsWith('var(--') && import.meta.client) {
    try {
      const cssVar = color.match(/var\(([^)]+)\)/)?.[1]
      if (!cssVar) return '#000000'

      const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
      if (!value) return '#000000'

      if (value.startsWith('#')) return value.length === 7 ? value : '#000000'
      if (value.startsWith('rgb')) return rgbToHex(value)
      return cssColorToHex(value)
    } catch {
      return '#000000'
    }
  }

  return '#000000'
}

const getColorForDisplay = (pkgName: string): string => {
  if (colorRefs.value[pkgName] && colorRefs.value[pkgName] !== '#000000') {
    return colorRefs.value[pkgName]
  }

  const pkg = props.packages.find(p => p.name === pkgName)
  if (!pkg) return '#000000'

  const color = props.customColors?.[pkgName] || pkg.color || '#000000'
  return import.meta.client ? resolveColor(color) : '#000000'
}

const updatePackageColor = (pkgName: string, color: string) => {
  if (!color) return

  colorRefs.value[pkgName] = color
  hexInputRefs.value[pkgName] = color.toUpperCase()
  emit('update:customColors', {
    ...(props.customColors || {}),
    [pkgName]: color
  })
}

watch(() => props.packages, () => {
  props.packages.forEach(pkg => {
    hexInputRefs.value[pkg.name] = getColorForDisplay(pkg.name).toUpperCase()
  })
}, { immediate: true })

watch(() => colorRefs.value, () => {
  props.packages.forEach(pkg => {
    const currentColor = getColorForDisplay(pkg.name)
    const currentHex = hexInputRefs.value[pkg.name]?.replace('#', '').toUpperCase()
    const newHex = currentColor.replace('#', '').toUpperCase()

    if (!currentHex || currentHex.length !== 6 || currentHex !== newHex) {
      hexInputRefs.value[pkg.name] = currentColor.toUpperCase()
    }
  })
}, { deep: true })

watchEffect(() => {
  if (!import.meta.client) return

  props.packages.forEach(pkg => {
    const color = props.customColors?.[pkg.name] || pkg.color || '#000000'
    if (!colorRefs.value[pkg.name] || colorRefs.value[pkg.name] === '#000000') {
      const resolved = resolveColor(color)
      if (resolved && resolved !== '#000000') {
        colorRefs.value[pkg.name] = resolved
      }
    }
  })
})

const validateAndUpdateHex = (pkgName: string, value: string) => {
  let hex = value.replace('#', '').toUpperCase().replace(/[^0-9A-F]/gi, '').slice(0, 6)
  hexInputRefs.value[pkgName] = hex ? `#${hex}` : '#'

  if (hex.length === 6) {
    updatePackageColor(pkgName, `#${hex}`)
  }
}

const handleHexBlur = (pkgName: string) => {
  const cleanHex = (hexInputRefs.value[pkgName] || '').replace('#', '').toUpperCase()

  if (cleanHex.length !== 6) {
    hexInputRefs.value[pkgName] = getColorForDisplay(pkgName).toUpperCase()
  } else {
    hexInputRefs.value[pkgName] = `#${cleanHex}`
    updatePackageColor(pkgName, `#${cleanHex}`)
  }
}
</script>

<template>
  <UModal :open="modelValue" @update:open="emit('update:modelValue', $event)" title="Customize Chart">
    <template #content>
      <div class="p-4 space-y-6">
        <div>
          <UFormField label="Background" class="mb-4">
            <UTabs
              :model-value="backgroundType"
              @update:model-value="emit('update:backgroundType', $event)"
              :items="[
                { label: 'Solid', value: 'solid' },
                { label: 'Dotted', value: 'dotted' }
              ]"
              size="sm"
            />
          </UFormField>

          <UFormField label="Chart Style" class="mb-4">
            <UTabs
              :model-value="chartMode"
              @update:model-value="emit('update:chartMode', $event)"
              :items="[
                { label: 'Area', value: 'area' },
                { label: 'Line', value: 'line' }
              ]"
              size="sm"
            />
          </UFormField>

          <UFormField label="Line Width" class="mb-4">
            <div class="space-y-2">
              <USlider
                :model-value="lineWidth"
                @update:model-value="emit('update:lineWidth', $event)"
                :min="1"
                :max="5"
                :step="1"
                size="md"
              />
              <div class="text-xs text-muted">{{ lineWidth }}px</div>
            </div>
          </UFormField>

          <div v-if="packages.length > 1" class="space-y-4">
            <h4 class="text-sm font-semibold text-muted">Line Colors</h4>
            <div v-for="pkg in packages" :key="pkg.name" class="flex items-center justify-between gap-4 py-1">
              <div class="flex items-center gap-2 min-w-0">
                <div
                  class="size-3 rounded-full shrink-0"
                  :style="{ backgroundColor: props.customColors?.[pkg.name] || pkg.color }"
                />
                <span class="text-sm truncate">{{ pkg.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    size="xs"
                    :ui="{ base: 'p-1.5' }"
                  >
                    <template #leading>
                      <span
                        class="size-4 rounded border border-neutral-300 dark:border-neutral-700"
                        :style="{ backgroundColor: getColorForDisplay(pkg.name) }"
                      />
                    </template>
                  </UButton>
                  <template #content>
                    <UColorPicker
                      :model-value="getColorForDisplay(pkg.name)"
                      @update:model-value="(color: string | undefined) => color && updatePackageColor(pkg.name, color)"
                      class="p-2"
                    />
                  </template>
                </UPopover>
                <UInput
                  :model-value="hexInputRefs[pkg.name] || getColorForDisplay(pkg.name).toUpperCase()"
                  @update:model-value="(value: string | undefined) => value && validateAndUpdateHex(pkg.name, value)"
                  @blur="handleHexBlur(pkg.name)"
                  size="xs"
                  :ui="{
                    base: 'w-20 font-mono text-xs px-2 py-1'
                  }"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
