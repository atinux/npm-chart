<script setup lang="ts">
import { format } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'

const cardRef = ref<HTMLElement | null>(null)
const period = ref<Period>('monthly')
const { width } = useElementSize(cardRef)

const props = defineProps({
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
</script>

<template>
  <div class="flex flex-col gap-2 w-full md:w-[680px]" ref="cardRef">
    <div class="flex flex-col sm:flex-row gap-2 justify-between items-center">
      <div class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ formatNumber(total) }} total npm downloads</div>
      <UTabs
        :items="[{ label: 'month' }, { label: 'week' }]"
        @change="selectPeriod"
        :ui="{
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
    </div>
    <VisXYContainer :data="data" class="h-96" :width="width">
      <VisLine :x="x" :y="y" color="rgb(var(--color-primary-DEFAULT))" />
      <VisArea :x="x" :y="y" color="rgb(var(--color-primary-DEFAULT))" :opacity="0.1" />

      <VisAxis type="x" :x="x" :tick-format="xTicks" />
      <VisAxis type="y" :tick-format="(y) => formatNumberCompact(y)" />

      <VisCrosshair color="rgb(var(--color-primary-DEFAULT))" :template="template" />

      <VisTooltip />
    </VisXYContainer>
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