<script setup lang="ts">
import { domToPng, domToSvg } from 'modern-screenshot'
import { format, endOfMonth, subMonths } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip, VisAnnotations } from '@unovis/vue'
import type { UnovisText } from '@unovis/ts'
import { getColorForPackage } from '~/utils/colors'
const props = defineProps<{
  pkg?: string
  total?: number
  data?: Record<string, number>
  packages?: PackageChartData[]
  initialColors?: Record<string, string>
}>()

const emit = defineEmits<{
  'update:colors': [colors: Record<string, string>]
}>()

const cardRef = ref<HTMLElement | null>(null)
const periodSelected = ref<Period>('monthly')

const backgroundType = useCookie<'solid' | 'dotted'>('chart-background-type', {
  default: () => 'solid'
})
const chartMode = useCookie<'area' | 'line'>('chart-mode', {
  default: () => 'area'
})
const lineWidth = useCookie<number>('chart-line-width', {
  default: () => 1
})

const customColors = ref<Record<string, string>>({})

watch(() => props.initialColors, (newColors) => {
  if (newColors) {
    customColors.value = { ...newColors }
  }
}, { immediate: true })

watch(customColors, (newColors) => {
  if (import.meta.client) {
    emit('update:colors', { ...newColors })
  }
}, { deep: true })

const customizeModalOpen = ref(false)
const { width } = useElementSize(cardRef)
const appConfig = useAppConfig()
const colorMode = useColorMode()

const packagesData = computed(() => {
  if (props.packages && props.packages.length > 0) {
    if (props.packages.length === 1) {
      return props.packages.map((pkg: PackageChartData) => ({
        ...pkg,
        color: (customColors.value && customColors.value[pkg.name]) || pkg.color || 'var(--ui-primary)'
      }))
    }

    const usedColors = new Set<string>()
    return props.packages.map((pkg: PackageChartData, index: number) => {
      const customColor = customColors.value && customColors.value[pkg.name]
      if (customColor) {
        usedColors.add(customColor)
        return {
          ...pkg,
          color: customColor
        }
      }

      if (pkg.color && !usedColors.has(pkg.color)) {
        usedColors.add(pkg.color)
        return {
          ...pkg,
          color: pkg.color
        }
      }

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
  if (props.pkg && props.data) {
    return [{
      name: props.pkg,
      total: props.total || 0,
      downloads: props.data,
      color: (customColors.value && customColors.value[props.pkg]) || 'var(--ui-primary)'
    }]
  }
  return []
})

const allDataSeries = computed(() => {
  const periodFormat = periodSelected.value === 'monthly' ? 'MM-yyyy' : 'ww-yyyy'
  const until = endOfMonth(subMonths(new Date(), 1))

  const processedPackages = packagesData.value.map((pkg: PackageChartData) => {
    const periodData: Record<string, DataRecord> = {}

    for (const date in pkg.downloads) {
      const dateObj = new Date(date)
      if (periodSelected.value === 'monthly' && dateObj >= until) {
        continue
      }
      const p = format(date, periodFormat)
      if (!periodData[p]) {
        periodData[p] = { amount: 0, date: dateObj }
      }
      if (pkg.downloads[date]) {
        periodData[p].amount += pkg.downloads[date]
      }
    }

    return {
      name: pkg.name,
      color: pkg.color,
      periodData
    }
  })

  const allPeriods = new Set<string>()
  processedPackages.forEach((pkg: { periodData: Record<string, DataRecord> }) => {
    Object.keys(pkg.periodData).forEach(period => allPeriods.add(period))
  })

  const periodsWithDates: Array<{ period: string; date: Date }> = []
  processedPackages.forEach((pkg: { periodData: Record<string, DataRecord> }) => {
    Object.entries(pkg.periodData).forEach(([period, record]: [string, DataRecord]) => {
      if (!periodsWithDates.find(p => p.period === period)) {
        periodsWithDates.push({ period, date: record.date })
      }
    })
  })

  periodsWithDates.sort((a, b) => a.date.getTime() - b.date.getTime())
  const sortedPeriods = periodsWithDates.map(p => p.period)

  const unifiedDates: Record<string, Date> = {}
  periodsWithDates.forEach(({ period, date }) => {
    unifiedDates[period] = date
  })

  return processedPackages.map((pkg: { name: string; color: string; periodData: Record<string, DataRecord> }) => {
    const dataPoints: DataRecord[] = sortedPeriods.map(period => {
      if (pkg.periodData[period]) {
        return pkg.periodData[period]
      }
      return {
        date: unifiedDates[period] || new Date(),
        amount: 0
      }
    })

    const sortedDataPoints = dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime())

    return {
      name: pkg.name,
      color: pkg.color,
      data: sortedDataPoints
    }
  })
})

const x = (_: DataRecord, i: number) => i

const getSeriesY = (seriesIndex: number) => {
  return (d: DataRecord, i: number) => {
    const series = allDataSeries.value[seriesIndex]
    if (!series) return 0
    const point = series.data[i + startDateIndex.value]
    return point ? point.amount : 0
  }
}

const allData = computed(() => {
  return allDataSeries.value[0]?.data || []
})

const data = computed(() => allData.value.slice(startDateIndex.value))

const startDateIndex = ref(0)
watch(periodSelected, () => {
  startDateIndex.value = 0
})

const annotations = computed(() => {
  return allDataSeries.value.map((series: { name: string; color: string; data: DataRecord[] }) => {
    const lastVisibleIndex = data.value.length - 1
    const actualIndex = lastVisibleIndex + startDateIndex.value
    const lastDataPoint = series.data[actualIndex]
    return {
      x: lastVisibleIndex,
      y: lastDataPoint?.amount || 0,
      content: { text: series.name, color: series.color } as UnovisText
    }
  })
})

const crosshairColors = computed(() => {
  return allDataSeries.value.map((series: { color: string }) => series.color)
})

const formatNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format
const formatNumberCompact = (value: number, maximumFractionDigits: number = 0) => Intl.NumberFormat('en', { maximumFractionDigits, notation: 'compact' }).format(value)

const formatDate = (date: Date, withYear: boolean = false): string => {
  const formats: Record<Period, string> = {
    weekly: format(date, 'd MMM' + (withYear ? ' yyyy' : '')),
    monthly: format(date, 'MMM yyy')
  }
  return formats[periodSelected.value as Period]
}

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return ''
  }

  return formatDate(data.value[i].date)
}

const template = (d: DataRecord) => {
  const dateStr = formatDate(d.date, true)
  const index = data.value.findIndex((point: DataRecord) => point.date.getTime() === d.date.getTime())
  if (index === -1) return dateStr

  const actualIndex = index + startDateIndex.value
  const values = allDataSeries.value.map((series: { name: string; color: string; data: DataRecord[] }) => {
    const point = series.data[actualIndex]
    const amount = point ? point.amount : 0
    return `<span style="color: ${series.color}">●</span> ${series.name}: ${formatNumber(amount)}`
  })
  return `<div style="font-weight: 600; margin-bottom: 4px;">${dateStr}</div><div>${values.join('<br>')}</div>`
}

const downloading = ref(false)
async function download(type: 'png' | 'svg') {
  downloading.value = true
  const downloadMethod = type === 'png' ? domToPng : domToSvg
  const dataUrl = await downloadMethod(document.querySelector('#npm-chart') as Node, {
    scale: 3
  })
  const link = document.createElement('a')
  const pkgNames = packagesData.value.map((p: PackageChartData) => p.name).join('+')
  link.download = `${pkgNames}-downloads.${type}`
  link.href = dataUrl
  link.click()
  downloading.value = false
}
const downloadDropdownOpen = ref(false)
defineShortcuts({
  m: () => {
    periodSelected.value = 'monthly'
  },
  w: () => {
    periodSelected.value = 'weekly'
  },
  'd-p': () => download('png'),
  'd-s': () => download('svg'),
  e: () => downloadDropdownOpen.value = !downloadDropdownOpen.value
})

const url = computed(() => {
  const pkgNames = packagesData.value.map((p: PackageChartData) => p.name).join('+')
  const theme = appConfig.theme
  const ui = appConfig.ui
  const baseUrl = `https://npm.chart.dev/${pkgNames}?blackAsPrimary=${theme?.blackAsPrimary}&primary=${ui?.colors?.primary}&gray=${ui?.colors?.neutral}&theme=${colorMode.value}`

  if (Object.keys(customColors.value).length > 0) {
    const colorsParam = btoa(JSON.stringify(customColors.value))
    return `${baseUrl}&colors=${colorsParam}`
  }

  return baseUrl
})

const iframeEmbed = computed(() => {
  return `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="${url.value.replace('npm.chart.dev/', 'npm.chart.dev/embed/')}" frameborder="0" allow="clipboard-write;" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="NPM Chart"></iframe></div>`
})

const { copy, copied } = useClipboard({ source: url })

const embedModalOpen = ref(false)
</script>

<template>
  <div class="flex flex-col gap-2 w-full md:w-[680px]" ref="cardRef">
    <div class="flex flex-col sm:flex-row gap-2 justify-between items-center">
      <div class="font-mono text-xs text-muted">
        <span v-if="packagesData.length === 1">
          {{ formatNumber(packagesData[0]!.total) }} total npm downloads
        </span>
        <span v-else class="flex flex-wrap gap-x-2">
          <span v-for="(pkg, index) in packagesData" :key="pkg.name">
            <span :style="{ color: pkg.color }">{{ pkg.name }}</span>: {{ formatNumber(pkg.total) }}<span v-if="index < packagesData.length - 1">,</span>
          </span>
        </span>
      </div>
      <ChartControls
        :period-selected="periodSelected"
        :downloading="downloading"
        :copied="copied"
        :download-dropdown-open="downloadDropdownOpen"
        @update:period-selected="periodSelected = $event"
        @update:download-dropdown-open="downloadDropdownOpen = $event"
        @download="download"
        @copy="copy()"
        @open-embed="embedModalOpen = true"
        @open-customize="customizeModalOpen = true"
      />
    </div>
    <div id="npm-chart" class="bg-linear-to-b p-4 -mx-4 sm:p-6 sm:-mx-6 sm:rounded-lg" :class="[appConfig.theme.blackAsPrimary ? 'dark:from-neutral-300 dark:to-neutral-400 from-neutral-600 to-neutral-700' : 'dark:from-primary-400 dark:to-primary-500 from-primary-300 to-primary-400']">
      <div class="group relative rounded overflow-hidden h-96 bg-neutral-100 dark:bg-neutral-950">
        <div v-if="backgroundType === 'dotted'" class="dot-pattern absolute inset-0 pointer-events-none" style="z-index: 1;" />
        <VisXYContainer
          :data="data"
          class="h-96 rounded relative"
          :class="[backgroundType === 'dotted' ? 'chart-dotted' : 'bg-neutral-100 dark:bg-neutral-950']"
          :width="width"
          :padding="{ top: 10 }"
          :margin="{ bottom: 15, left: 10 }"
          style="z-index: 2;"
        >
        <template v-for="(series, index) in allDataSeries" :key="series.name">
          <VisLine
            :data="data"
            :x="x"
            :y="getSeriesY(index)"
            :color="series.color"
            :line-width="lineWidth"
          />
          <VisArea
            v-if="chartMode === 'area'"
            :data="data"
            :x="x"
            :y="getSeriesY(index)"
            :color="series.color"
            :opacity="0.1"
          />
        </template>

        <VisAxis type="x" :x="x" :tick-format="xTicks" />
        <VisAxis type="y" :tick-format="(y: number) => formatNumberCompact(y, 1)" />

        <VisCrosshair :color="crosshairColors" :template="template" />

        <VisAnnotations :items="annotations" />

        <VisTooltip />
      </VisXYContainer>
      <div v-if="packagesData.length > 1" class="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-row gap-3 px-2 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm transition-opacity duration-200 group-hover:opacity-0">
        <div v-for="pkg in packagesData" :key="pkg.name" class="flex items-center gap-2 text-xs font-medium">
          <div
            class="size-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: pkg.color }"
          />
          <span class="text-neutral-900 dark:text-neutral-100">{{ pkg.name }}</span>
        </div>
      </div>
      </div>
    </div>
    <ChartTimeline
      v-model="startDateIndex"
      :min="0"
      :max="allData.length - 2"
      :start-date="allData[startDateIndex]?.date"
    />
  </div>
  <ChartEmbed
    v-model="embedModalOpen"
    :iframe-embed="iframeEmbed"
  />
  <ChartCustomize
    v-model="customizeModalOpen"
    :background-type="backgroundType"
    :chart-mode="chartMode"
    :line-width="lineWidth"
    :packages="packagesData"
    :custom-colors="customColors"
    @update:background-type="backgroundType = $event"
    @update:chart-mode="chartMode = $event"
    @update:line-width="lineWidth = $event"
    @update:custom-colors="customColors = $event"
  />
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: #fff;
  --vis-crosshair-circle-fill-color: #fff;

  --vis-axis-grid-color: var(--ui-color-neutral-200);
  --vis-axis-tick-color: var(--ui-color-neutral-200);
  --vis-axis-tick-label-color: var(--ui-color-neutral-400);

  --vis-tooltip-background-color: #fff;
  --vis-tooltip-border-color: var(--ui-color-neutral-200);
  --vis-tooltip-text-color: var(--ui-color-neutral-900);

  --vis-annotation-text-color: var(--ui-primary);
}

.dark {
  .unovis-xy-container {
    --vis-crosshair-line-stroke-color: var(--ui-primary);

    --vis-axis-grid-color: var(--ui-color-neutral-800);
    --vis-axis-tick-color: var(--ui-color-neutral-800);
    --vis-axis-tick-label-color: var(--ui-color-neutral-500);

    --vis-tooltip-background-color: var(--ui-color-neutral-900);
    --vis-tooltip-border-color: var(--ui-color-neutral-800);
    --vis-tooltip-text-color: #fff;
    --vis-annotation-text-color: var(--ui-primary);
  }
}

.dot-pattern {
  background-image: radial-gradient(#111827 1px, transparent 1px);
  background-size: 7px 7px;
  background-position: -8.5px -8.5px;
  opacity: 0.2;
  mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1), transparent 75%);
}

.dark .dot-pattern {
  background-image: radial-gradient(#9ca3af 1px, transparent 1px);
}

.chart-dotted {
  --vis-axis-grid-color: transparent !important;
  --vis-axis-tick-color: transparent !important;
  background: transparent !important;
}

.chart-dotted :deep(svg) {
  background: transparent !important;
}

.chart-dotted :deep(svg > rect) {
  fill: transparent !important;
}

.chart-dotted :deep(svg rect[fill*="neutral"]) {
  fill: transparent !important;
}
</style>
