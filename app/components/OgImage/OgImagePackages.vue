<script lang="ts" setup>
import { endOfMonth, format, subMonths } from 'date-fns'

const props = defineProps<{
  packages: string[]
  description?: string
}>()

const packagesData = await $fetch(`/api/packages/${props.packages.join('+')}`)
const packagesArray = Array.isArray(packagesData) ? packagesData.filter(Boolean) : packagesData ? [packagesData] : []

const periodData: Record<string, DataRecord> = {}
const periodFormat = 'MM-yyyy'
const until = endOfMonth(subMonths(new Date(), 1))

packagesArray.forEach((pkg) => {
  if (!pkg.downloads) return
  for (const date in pkg.downloads) {
    const dateObj = new Date(date)
    if (dateObj >= until) continue

    const p = format(date, periodFormat)
    periodData[p] ||= { amount: 0, date: dateObj }
    if (pkg.downloads[date]) {
      periodData[p].amount += pkg.downloads[date]
    }
  }
})

const allDates = Object.keys(periodData).sort((a, b) => {
  const dateA = periodData[a]?.date
  const dateB = periodData[b]?.date
  if (!dateA || !dateB) return 0
  return dateA.getTime() - dateB.getTime()
})

const colorMap: Record<string, string> = {
  'var(--ui-color-primary-500)': 'rgb(59, 130, 246)',
  'var(--ui-color-success-500)': 'rgb(34, 197, 94)',
  'var(--ui-color-info-500)': 'rgb(59, 130, 246)',
  'var(--ui-color-warning-500)': 'rgb(245, 158, 11)',
  'var(--ui-color-error-500)': 'rgb(239, 68, 68)',
  'var(--ui-color-secondary-500)': 'rgb(168, 85, 247)',
  'var(--ui-color-primary-600)': 'rgb(37, 99, 235)',
  'var(--ui-color-success-600)': 'rgb(22, 163, 74)',
  'var(--ui-color-info-600)': 'rgb(37, 99, 235)',
  'var(--ui-color-warning-600)': 'rgb(217, 119, 6)',
  'var(--ui-color-error-600)': 'rgb(220, 38, 38)',
  'var(--ui-color-secondary-600)': 'rgb(147, 51, 234)',
  'var(--ui-color-primary-400)': 'rgb(96, 165, 250)',
  'var(--ui-color-success-400)': 'rgb(74, 222, 128)',
  'var(--ui-color-info-400)': 'rgb(96, 165, 250)',
  'var(--ui-color-warning-400)': 'rgb(251, 191, 36)',
  'var(--ui-color-error-400)': 'rgb(248, 113, 113)',
  'var(--ui-color-secondary-400)': 'rgb(192, 132, 252)',
}

const series = packagesArray.map((pkg, index: number) => {
  if (!pkg.downloads) return null

  const pkgData: Record<string, number> = {}

  allDates.forEach(period => {
    const periodDate = periodData[period]?.date
    if (!periodDate) return

    let total = 0
    for (const date in pkg.downloads) {
      const dateObj = new Date(date)
      if (format(dateObj, periodFormat) === period) {
        total += pkg.downloads[date] || 0
      }
    }
    pkgData[periodDate.toISOString()] = total
  })

  const colorVar = getColorForPackage(index)
  const color = colorMap[colorVar] || 'rgb(255, 153, 0)'

  return {
    data: pkgData,
    color
  }
}).filter(Boolean) as Array<{ data: Record<string, number>; color: string }>

const svg = await renderMultiChartToSVG(series, {
  width: 1260,
  height: 630,
})
</script>

<template>
  <div class="w-full h-full bg-neutral-100">
    <div class="-left-10 flex w-full h-full absolute opacity-50" v-html="svg" />
    <div class="w-full h-full flex flex-col pl-20 pr-20 relative" style="justify-content: flex-start; padding-top: 4rem; gap: 1.25rem;">
      <div style="max-width: 60%;">
        <div class="text-5xl font-bold" style="margin-bottom: 0.5rem;">
          <span class="text-amber-500">npm</span><span class="relative -left-2">.chart.dev</span>
        </div>
        <div class="text-5xl font-bold flex flex-wrap items-center leading-tight" style="gap: 0.75rem 0.5rem; margin-bottom: 0.5rem;">
          <template v-for="(pkg, index) in packagesArray" :key="index">
            <span>{{ pkg.name }}</span>
            <span v-if="index < packagesArray.length - 1" class="text-4xl">vs</span>
          </template>
        </div>
        <div v-if="props.description" class="text-lg text-neutral-600 dark:text-neutral-400" style="line-height: 1.5;">
          {{ props.description }}
        </div>
        <div v-else class="font-mono text-2xl text-neutral-600 dark:text-neutral-400">
          Comparing {{ packagesArray.length }} packages
        </div>
      </div>
    </div>
  </div>
</template>
