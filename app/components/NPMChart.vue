<script setup lang="ts">
import { domToPng, domToSvg } from 'modern-screenshot'
import { format, endOfMonth, subMonths } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip, VisAnnotations } from '@unovis/vue'
import type { AnnotationItem, NumericAccessor, UnovisText } from '@unovis/ts'

const cardRef = ref<HTMLElement | null>(null)
const period = ref<Period>('monthly')
const periodSelected = ref(0)
const { width } = useElementSize(cardRef)
const appConfig = useAppConfig()
const colorMode = useColorMode()

const props = defineProps<{
  pkg: string[]
  total: number[]
  data: PackageDownloadsByDate
  colors: string[]
}>()

const x = (_: SomeDataFormat[number], i: number) => i
const accesorFn = (pkgName: string): { y: NumericAccessor<SomeDataFormat[number]>; color: string } => {
  return {
    y: (d: SomeDataFormat[number]) => d.packages[pkgName],
    color: props.colors[props.pkg.indexOf(pkgName)]!
  }
}

type SomeDataFormat = { date: Date, packages: {[name:string]: number}}[]
const allData = computed<SomeDataFormat>(() => {
  const periodData: Record<string, Record<string, {amount: number, date: Date}>> = {}
  const periodFormat = period.value === 'monthly' ? 'MM-yyyy' : 'ww-yyyy'
  const until = endOfMonth(subMonths(new Date(), 1))
  
  for (const date in props.data) {
    const dateObj = new Date(date)
    if (period.value === 'monthly' && dateObj >= until) {
      continue
    }
    const p = format(date, periodFormat)
    periodData[p] ||= Object.fromEntries(props.pkg.map(pkg => [pkg, { amount: 0, date: dateObj }]))
    if (props.data[date]) {
      for (const pkg of props.pkg) {
        periodData[p][pkg]!.amount += props.data[date][pkg] ?? 0
      }
    }
  }
  const res = Object.entries(periodData).map(([_, pkgObj]) => ({
    date: pkgObj[props.pkg[0]!]!.date,
    packages: Object.fromEntries(props.pkg.map(pkg => [pkg, pkgObj[pkg]!.amount]))
  })).sort((a, b) => a.date.getTime() - b.date.getTime())
  return res
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
  if (i === 0 || i === data.value.length - 1 || !data.value[i]?.date) {
    return ''
  }
  const res = formatDate(new Date(data.value[i].date))
  return res
}
const template = (d: SomeDataFormat[number]) => `${formatDate(d.date)}<br><br>${props.pkg.map(pkg => `${pkg}: ${formatNumber(d.packages[pkg]!)}`).join(' downloads<br>')} downloads`
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
  e: () => downloadDropdownOpen.value = !downloadDropdownOpen.value
})

const url = computed(() => {
  return `https://npm.chart.dev/${props.pkg}?primary=${appConfig.ui.primary}&gray=${appConfig.ui.gray}&theme=${colorMode.value}`
})

const iframeEmbed = computed(() => {
  return `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="${url.value.replace('npm.chart.dev/', 'npm.chart.dev/embed/')}" frameborder="0" allow="clipboard-write;" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="NPM Chart"></iframe></div>`
})

const { copy, copied } = useClipboard({ source: url })

const { copy: copyEmbed, copied: copiedEmbed } = useClipboard({ source: iframeEmbed })

const embedModalOpen = ref(false)
const annotationItems = computed(() => {
  return props.pkg.map((packageName, index): AnnotationItem => {    
    return {
      x: props.pkg.length === 1 
        ? '40%'
        : `${(index / (props.pkg.length - 1)) * 80 - Math.min(index, packageName.length)}%`,
      y: '110.5%',
      content: {
        text: packageName,
        color: props.colors[index],
      } as UnovisText
    };
  });
})
</script>

<template>
  <div class="flex flex-col gap-2 w-full md:w-[680px]" ref="cardRef">
    <div class="flex flex-col sm:flex-row gap-2 justify-between items-center">
      <!-- This needs a better way to display
       <div class="font-mono text-xs text-gray-600 dark:text-gray-400">{{ formatNumber(total) }} total npm downloads</div>
      -->
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
        <UTooltip text="Embed chart" :popper="{ placement: 'top' }">
          <UButton variant="link" color="gray" icon="i-heroicons-code-bracket" size="xs" :padded="false" aria-label="Embed chart" @click="embedModalOpen = true" class="ml-1" />
        </UTooltip>
      </div>
    </div>
    <div id="npm-chart" class="bg-gradient-to-b dark:from-primary-400 dark:to-primary-500 from-primary-300 to-primary-400 p-4 -mx-4 sm:p-6 sm:-mx-6 sm:rounded-lg">
      <VisXYContainer
        :data="data"
        class="h-96 bg-gray-100 dark:bg-gray-950 rounded"
        :width="width"
        :padding="{ top: 10, bottom: 0 }"
        :margin="{ bottom: 30, left: 10 }"
      >
      <template v-for="name in pkg">
        <VisLine :x v-bind="accesorFn(name)" />
        <VisArea :x v-bind="accesorFn(name)" :opacity="0.1" />
      </template>
        <VisAxis type="x" :x :tick-format="xTicks" />
        <VisAxis type="y" :tick-format="(y: number) => formatNumberCompact(y, 1)" />
        <VisCrosshair :template />
        <VisAnnotations :items="annotationItems" />
        <VisTooltip />
      </VisXYContainer>
    </div>
    <div class="mt-2">
      <URange v-model="startDateIndex" :min="0" :max="allData.length - 2" :step="1" size="sm" />
      <div class="text-xs text-gray-600 dark:text-gray-400 mt-2" v-if="allData[startDateIndex]">
        Start at {{ formatDate(allData[startDateIndex]!.date, true) }}
      </div>
    </div>
  </div>
  <UModal v-model="embedModalOpen">
    <div class="p-4">
      <div class="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Copy the code below to embed the chart on your website.
      </div>
      <UTextarea :value="iframeEmbed" class="mb-4"></UTextarea>
      <UButton color="gray" :icon="copiedEmbed ? 'i-heroicons-check' : 'i-heroicons-link'" size="xs" :label="copiedEmbed ? 'Copied!' : 'Copy embed code'" @click="copyEmbed()" class="ml-1" />
    </div>
  </UModal>
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
