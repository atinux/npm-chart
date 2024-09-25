<script setup lang="ts">
import { domToPng, domToSvg } from 'modern-screenshot'
import { format, endOfMonth, subMonths } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip, VisAnnotations } from '@unovis/vue'

const cardRef = ref<HTMLElement | null>(null)
const period = ref<Period>('monthly')
const periodSelected = ref(0)
const { width } = useElementSize(cardRef)
const appConfig = useAppConfig()
const colorMode = useColorMode()

const props = defineProps({
  pkg: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  data: {
    type: Object as PropType<Record<string, number>>,
    required: true
  }
})

type Period = 'weekly' | 'monthly'

interface DataRecord {
  date: Date
  downloads: number
}

const x = (_: DataRecord, i: number) => i
const y = (d: DataRecord) => d.amount

const allData = computed(() => {
  const periodData = {}
  const periodFormat = period.value === 'monthly' ? 'MM-yyyy' : 'ww-yyyy'
  const until = endOfMonth(subMonths(new Date(), 1))
  for (const date in props.data) {
    if (period.value === 'monthly' && new Date(date) >= until) {
      continue
    }
    const p = format(date, periodFormat)
    periodData[p] ||= { amount: 0, date }
    periodData[p].amount += props.data[date]
  }
  return Object.entries(periodData).map(([period, { date, amount }]) => ({ date, amount }))
})
const data = computed(() => allData.value.slice(startDateIndex.value))

const startDateIndex = ref(0)
watch(period, () => {
  startDateIndex.value = 0
})
const formatNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format
const formatNumberCompact = (value: number, maximumFractionDigits: number = 0) => Intl.NumberFormat('en', { maximumFractionDigits, notation: 'compact' }).format(value)

const formatDate = (date: Date, withYear: boolean = false): string => {
  return ({
    weekly: format(date, 'd MMM' + (withYear ? ' yyyy' : '')),
    monthly: format(date, 'MMM yyy')
  })[period.value]
}

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return ''
  }

  return formatDate(data.value[i].date)
}
const template = (d: DataRecord) => `${formatDate(d.date)}: ${formatNumber(d.amount)}`
function selectPeriod(index: number) {
  periodSelected.value = index
  period.value = index === 0 ? 'monthly' : 'weekly'
}
const downloading = ref(false)
async function download(type: 'png' | 'svg') {
  downloading.value = true
  const downloadMethod = type === 'png' ? domToPng : domToSvg
  const dataUrl = await downloadMethod(document.querySelector('#npm-chart') as Node, {
    scale: 3
  })
  const link = document.createElement('a')
  link.download = `${props.pkg}-downloads.${type}`
  link.href = dataUrl
  link.click()
  downloading.value = false
}
const downloadDropdownOpen = ref(false)
const downloadsItems = [[
  { icon: 'i-ph-file-png-light', label: '', click: () => download('png') },
  { icon: 'i-ph-file-svg-light', label: '', click: () => download('svg') },
]]
defineShortcuts({
  m: () => selectPeriod(0),
  w: () => selectPeriod(1),
  'd-p': () => download('png'),
  'd-s': () => download('svg'),
})

const url = computed(() => {
  return `https://npm.chart.dev/${props.pkg}?primary=${appConfig.ui.primary}&gray=${appConfig.ui.gray}&theme=${colorMode.value}`
})
const { copy, copied } = useClipboard({ source: url })
</script>

<template>
  <div class="flex flex-col gap-2 w-full md:w-[680px]" ref="cardRef">
    <div class="flex flex-col sm:flex-row gap-2 justify-between items-center">
      <div class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ formatNumber(total) }} total npm downloads</div>
      <div class="flex items-center gap-2">
        <UTabs
          :items="[{ label: 'month' }, { label: 'week' }]"
          @change="selectPeriod"
          v-model="periodSelected"
          :ui="{
            container: 'hidden',
            list: {
              height: 'h-7',
              padding: 'p-0.5',
              background: 'bg-gray-100 dark:bg-gray-950',
              marker: {
                rounded: 'rounded-md',
                background: 'bg-white dark:bg-gray-900',
              },
              tab: {
                height: 'h-6',
                padding: 'px-2',
                size: 'text-xs',
                font: 'font-light',
                rounded: 'rounded-sm',
                active: 'text-gray-800 dark:text-gray-200',
                inactive: 'hover:text-gray-900 dark:hover:text-gray-100',
              }
            }
          }"
        />
        <UDropdown
          v-model:open="downloadDropdownOpen"
          :items="downloadsItems"
          :ui="{
            width: 'w-auto relative',
            padding: 'p-0.5',
            item: {
              base: 'font-light gap-0',
              padding: 'px-1 py-1',
              size: 'text-sm',
              icon: {
                active: 'text-gray-800 dark:text-gray-200',
                inactive: 'text-gray-600 dark:text-gray-400',
              }
            }
          }"
        >
          <UTooltip text="Download chart" :popper="{ placement: 'top' }">
            <UButton variant="link" color="gray" icon="i-heroicons-camera" size="sm" :padded="false" aria-label="Download chart" :loading="downloading" />
          </UTooltip>
        </UDropdown>
        <UTooltip :text="copied ? 'URL copied' : 'Share chart'" :popper="{ placement: 'top' }">
          <UButton variant="link" color="gray" :icon="copied ? 'i-heroicons-check' : 'i-heroicons-link'" size="xs" :padded="false" aria-label="Share chart" @click="copy()" class="ml-1" />
        </UTooltip>
      </div>
    </div>
    <div id="npm-chart" class="bg-gradient-to-b dark:from-primary-400 dark:to-primary-500 from-primary-300 to-primary-400 p-4 -mx-4 sm:p-6 sm:-mx-6 sm:rounded-lg">
      <VisXYContainer
        :data="data"
        class="h-96 bg-gray-100 dark:bg-gray-950 rounded"
        :width="width"
        :padding="{ top: 10 }"
        :margin="{ bottom: 15, left: 10 }"
      >
        <VisLine :x="x" :y="y" color="rgb(var(--color-primary-DEFAULT))" />
        <VisArea :x="x" :y="y" color="rgb(var(--color-primary-DEFAULT))" :opacity="0.1" />

        <VisAxis type="x" :x="x" :tick-format="xTicks" />
        <VisAxis type="y" :tick-format="(y) => formatNumberCompact(y, 1)" />

        <VisCrosshair color="rgb(var(--color-primary-DEFAULT))" :template="template" />

        <VisAnnotations :items="[{ x: 0, y: 350, content: { text: pkg, color: 'var(--vis-annotation-text-color)' } }]" />

        <VisTooltip />
      </VisXYContainer>
    </div>
    <div class="mt-2">
      <URange v-model="startDateIndex" :min="0" :max="allData.length - 2" :step="1" size="sm" />
      <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">
        Start at {{ formatDate(allData[startDateIndex].date, true) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: rgb(var(--color-primary-500));
  --vis-crosshair-circle-stroke-color: #fff;

  --vis-axis-grid-color: rgb(var(--color-gray-200));
  --vis-axis-tick-color: rgb(var(--color-gray-200));
  --vis-axis-tick-label-color: rgb(var(--color-gray-400));

  --vis-tooltip-background-color: #fff;
  --vis-tooltip-border-color: rgb(var(--color-gray-200));
  --vis-tooltip-text-color: rgb(var(--color-gray-900));

  --vis-annotation-text-color: rgb(var(--color-primary-500));
}

.dark {
  .unovis-xy-container {
    --vis-crosshair-line-stroke-color: rgb(var(--color-primary-400));
    --vis-crosshair-circle-stroke-color: rgb(var(--color-gray-900));

    --vis-axis-grid-color: rgb(var(--color-gray-800));
    --vis-axis-tick-color: rgb(var(--color-gray-800));
    --vis-axis-tick-label-color: rgb(var(--color-gray-500));

    --vis-tooltip-background-color: rgb(var(--color-gray-900));
    --vis-tooltip-border-color: rgb(var(--color-gray-800));
    --vis-tooltip-text-color: #fff;
    --vis-annotation-text-color: rgb(var(--color-primary-400));
  }
}
</style>