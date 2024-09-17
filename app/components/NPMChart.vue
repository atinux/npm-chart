<script setup lang="ts">
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'

const cardRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(cardRef)

const props = defineProps({
  data: {
    type: Object as PropType<Record<string, number>>,
    required: true
  },
  period: {
    type: String as PropType<Period>,
    default: 'monthly'
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
  const periodFormat = props.period === 'monthly' ? 'MM-yyyy' : 'ww-yyyy'
  for (const date in props.data) {
    const period = format(date, periodFormat)
    periodData[period] ||= { amount: 0, date }
    periodData[period].amount += props.data[date]
  }
  return Object.entries(periodData).map(([period, { date, amount }]) => ({ date: formatDate(date), amount }))
})

const total = computed(() => data.value.reduce((acc: number, { amount }) => acc + amount, 0))

const formatNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format
const formatNumberCompact = new Intl.NumberFormat('en', { maximumFractionDigits: 0, notation: 'compact' }).format

const formatDate = (date: Date): string => {
  return ({
    weekly: format(date, 'd MMM'),
    monthly: format(date, 'MMM yyy')
  })[props.period]
}

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return ''
  }

  return formatDate(data.value[i].date)
}
const template = (d: DataRecord) => `${formatDate(d.date)}: ${formatNumber(d.amount)}`
</script>

<template>
  <div class="flex flex-col gap-2 w-full lg:w-[600px]" ref="cardRef">
    <div class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ formatNumber(total) }} total npm downloads</div>
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