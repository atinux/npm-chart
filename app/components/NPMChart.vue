<script setup lang="ts">
import { domToPng, domToSvg } from 'modern-screenshot'
import { format } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'

const cardRef = ref<HTMLElement | null>(null)
const period = ref<Period>('monthly')
const { width } = useElementSize(cardRef)

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

const data = computed(() => {
  const periodData = {}
  const periodFormat = period.value === 'monthly' ? 'MM-yyyy' : 'ww-yyyy'
  for (const date in props.data) {
    const period = format(date, periodFormat)
    periodData[period] ||= { amount: 0, date }
    periodData[period].amount += props.data[date]
  }
  return Object.entries(periodData).map(([period, { date, amount }]) => ({ date, amount }))
})

const formatNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format
const formatNumberCompact = new Intl.NumberFormat('en', { maximumFractionDigits: 0, notation: 'compact' }).format

const formatDate = (date: Date): string => {
  return ({
    weekly: format(date, 'd MMM'),
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
  period.value = index === 0 ? 'monthly' : 'weekly'
}
async function download(type: 'png' | 'svg') {
  const downloadMethod = type === 'png' ? domToPng : domToSvg
  const dataUrl = await downloadMethod(document.querySelector('#npm-chart') as Node, {
    scale: 3,
    style: {
      // margin: '10px'
    }
  })
  const link = document.createElement('a')
  link.download = `${props.pkg}-downloads.${type}`
  link.href = dataUrl
  link.click()
}
const downloadDropdownOpen = ref(false)
const downloadsItems = [[
  { icon: 'i-ph-file-png-light', label: '', click: () => download('png') },
  { icon: 'i-ph-file-svg-light', label: '', click: () => download('svg') },
]]
defineShortcuts({
  d: () => downloadDropdownOpen.value = !downloadDropdownOpen.value
})
</script>

<template>
  <div class="flex flex-col gap-2 w-full md:w-[680px]" ref="cardRef">
    <div class="flex flex-col sm:flex-row gap-2 justify-between items-center">
      <div class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ formatNumber(total) }} total npm downloads</div>
      <div class="flex items-center gap-2">
        <UTabs
          :items="[{ label: 'month' }, { label: 'week' }]"
          @change="selectPeriod"
          :ui="{
            container: 'hidden',
            list: {
              height: 'h-6',
              padding: 'p-0.5',
              background: 'bg-gray-100 dark:bg-gray-950',
              marker: {
                rounded: 'rounded-md',
                background: 'bg-white dark:bg-gray-900',
              },
              tab: {
                height: 'h-5',
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
              size: 'text-xs',
              icon: {
                active: 'text-gray-800 dark:text-gray-200',
                inactive: 'text-gray-600 dark:text-gray-400',
              }
            }
          }"
        >
          <UButton variant="link" color="gray" icon="i-heroicons-arrow-down-on-square" size="xs" :padded="false" aria-label="Download chart" />
        </UDropdown>
      </div>
    </div>
    <div id="npm-chart" class="bg-gradient-to-b dark:from-primary-400 dark:to-primary-500 from-primary-300 to-primary-400 p-6 -mx-6 sm:rounded-lg">
      <div class="text-gray-100 dark:text-gray-950 lowercase text-xs my-2">
        {{props.pkg}}
      </div>
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
        <VisAxis type="y" :tick-format="(y) => formatNumberCompact(y)" />

        <VisCrosshair color="rgb(var(--color-primary-DEFAULT))" :template="template" />

        <VisTooltip />
      </VisXYContainer>
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
  }
}
</style>