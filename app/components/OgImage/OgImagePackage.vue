<script lang="ts" setup>
import { endOfMonth, format, subMonths } from 'date-fns'
import { renderChartToSVG } from '../../../utils/chart'

const props = defineProps({
  pkg: {
    type: String,
    required: true,
  },
})
const data = await $fetch(`/api/packages/${props.pkg}`)

const periodData: Record<string, DataRecord> = {}
const periodFormat = 'MM-yyyy'
const until = endOfMonth(subMonths(new Date(), 1))
for (const date in data.downloads) {
  const dateObj = new Date(date)
  if (dateObj >= until) {
    continue
  }
  const p = format(date, periodFormat)
  periodData[p] ||= { amount: 0, date: dateObj }
  if (data.downloads[date]) {
    periodData[p].amount += data.downloads[date]
  }
}

const allData = Object.fromEntries(Object.values(periodData).map(({ date, amount }) => [date, amount]))

// Generate SVG
const svg = await renderChartToSVG(allData, {
  width: 1260,
  height: 630,
})

const formatNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format
</script>

<template>
  <div class="w-full h-full bg-neutral-100">
    <div class="-left-10 flex w-full h-full absolute opacity-50" v-html="svg" />
    <div class="w-full h-full flex flex-col justify-center pl-20 relative gap-6">
      <div class="text-5xl font-bold">
        <span class="text-amber-500">npm</span><span class="relative -left-2">.chart.dev</span>
      </div>
      <div class="text-7xl font-bold flex items-center p-0">
        {{ pkg }}
      </div>
      <div class="font-mono text-5xl text-neutral-600 dark:text-neutral-400 mt-2">
        {{ formatNumber(data.total) }} total npm downloads
      </div>
    </div>
  </div>
</template>
