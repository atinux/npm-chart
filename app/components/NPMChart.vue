<script setup lang="ts">
import { domToPng, domToSvg } from 'modern-screenshot'
import { format, endOfMonth, subMonths } from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip, VisAnnotations } from '@unovis/vue'
import type { UnovisText } from '@unovis/ts'

const cardRef = ref<HTMLElement | null>(null)
const periodSelected = ref<Period>('monthly')
const { width } = useElementSize(cardRef)
const appConfig = useAppConfig()
const colorMode = useColorMode()

const props = defineProps<{
  pkg: string
  total: number
  data: Record<string, number>
}>()

const x = (_: DataRecord, i: number) => i
const y = (d: DataRecord) => d.amount

const allData = computed(() => {
  const periodData: Record<string, DataRecord> = {}
  const periodFormat = periodSelected.value === 'monthly' ? 'MM-yyyy' : 'ww-yyyy'
  const until = endOfMonth(subMonths(new Date(), 1))
  for (const date in props.data) {
    const dateObj = new Date(date)
    if (periodSelected.value === 'monthly' && dateObj >= until) {
      continue
    }
    const p = format(date, periodFormat)
    periodData[p] ||= { amount: 0, date: dateObj }
    if (props.data[date]) {
      periodData[p].amount += props.data[date]
    }
  }
  return Object.entries(periodData).map(([_period, { date, amount }]) => ({ date, amount }))
})
const data = computed(() => allData.value.slice(startDateIndex.value))

const startDateIndex = ref(0)
watch(periodSelected, () => {
  startDateIndex.value = 0
})
const formatNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format
const formatNumberCompact = (value: number, maximumFractionDigits: number = 0) => Intl.NumberFormat('en', { maximumFractionDigits, notation: 'compact' }).format(value)

const formatDate = (date: Date, withYear: boolean = false): string => {
  return ({
    weekly: format(date, 'd MMM' + (withYear ? ' yyyy' : '')),
    monthly: format(date, 'MMM yyy')
  })[periodSelected.value]
}

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return ''
  }

  return formatDate(data.value[i].date)
}
const template = (d: DataRecord) => `${formatDate(d.date)}: ${formatNumber(d.amount)}`
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
  { icon: 'i-ph-file-png-light', label: 'Save as PNG', onSelect: () => download('png') },
  { icon: 'i-ph-file-svg-light', label: 'Save as SVG', onSelect: () => download('svg') },
]]
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
  return `https://npm.chart.dev/${props.pkg}?blackAsPrimary=${appConfig.theme.blackAsPrimary}&primary=${appConfig.ui.colors.primary}&gray=${appConfig.ui.colors.neutral}&theme=${colorMode.value}`
})

const iframeEmbed = computed(() => {
  return `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="${url.value.replace('npm.chart.dev/', 'npm.chart.dev/embed/')}" frameborder="0" allow="clipboard-write;" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="NPM Chart"></iframe></div>`
})

const { copy, copied } = useClipboard({ source: url })

const { copy: copyEmbed, copied: copiedEmbed } = useClipboard({ source: iframeEmbed })

const embedModalOpen = ref(false)
</script>

<template>
  <div class="flex flex-col gap-2 w-full md:w-[680px]" ref="cardRef">
    <div class="flex flex-col sm:flex-row gap-2 justify-between items-center">
      <div class="font-mono text-xs text-muted">{{ formatNumber(total) }} total npm downloads</div>
      <div class="flex items-center gap-2">
        <UTabs
          :items="[{ label: 'month', value: 'monthly' }, { label: 'week', value: 'weekly' }]"
          color="neutral"
          v-model="periodSelected"
          size="sm"
          :ui="{
            root: 'h-7',
            list: 'p-0.25 bg-transparent',
            indicator: 'bg-white dark:bg-neutral-800',
            trigger: 'data-[state=active]:text-default data-[state=inactive]:text-muted'
          }"
        />
        <UDropdownMenu
          v-model:open="downloadDropdownOpen"
          :items="downloadsItems"
          size="sm"
          
        >
          <UTooltip text="Download chart" :popper="{ placement: 'top' }">
            <UButton variant="link" color="neutral" icon="i-heroicons-camera" size="sm" :padded="false" aria-label="Download chart" :loading="downloading" />
          </UTooltip>
        </UDropdownMenu>
        <UTooltip :text="copied ? 'URL copied' : 'Share chart'" :popper="{ placement: 'top' }">
          <UButton variant="link" color="neutral" :icon="copied ? 'i-heroicons-check' : 'i-heroicons-link'" size="xs" :padded="false" aria-label="Share chart" @click="copy()" class="ml-1" />
        </UTooltip>
        <UTooltip text="Embed chart" :popper="{ placement: 'top' }">
          <UButton variant="link" color="neutral" icon="i-heroicons-code-bracket" size="xs" :padded="false" aria-label="Embed chart" @click="embedModalOpen = true" class="ml-1" />
        </UTooltip>
      </div>
    </div>
    <div id="npm-chart" class="bg-linear-to-b p-4 -mx-4 sm:p-6 sm:-mx-6 sm:rounded-lg" :class="[appConfig.theme.blackAsPrimary ? 'bg-neutral-950 dark:bg-neutral-50' : 'dark:from-primary-400 dark:to-primary-500 from-primary-300 to-primary-400']">
      <VisXYContainer
        :data="data"
        class="h-96 bg-neutral-100 dark:bg-neutral-950 rounded"
        :width="width"
        :padding="{ top: 10 }"
        :margin="{ bottom: 15, left: 10 }"
      >
        <VisLine :x="x" :y="y" color="var(--ui-primary)" />
        <VisArea :x="x" :y="y" color="var(--ui-primary)" :opacity="0.1" />

        <VisAxis type="x" :x="x" :tick-format="xTicks" />
        <VisAxis type="y" :tick-format="(y: number) => formatNumberCompact(y, 1)" />

        <VisCrosshair color="var(--ui-primary)" :template="template" />

        <VisAnnotations :items="[{ x: 0, y: 350, content: { text: pkg, color: 'var(--vis-annotation-text-color)' } as UnovisText }]" />

        <VisTooltip />
      </VisXYContainer>
    </div>
    <div class="mt-2">
      <USlider v-model="startDateIndex" :min="0" :max="allData.length - 2" :step="1" size="xs" />
      <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-2" v-if="allData[startDateIndex]">
        Start at {{ formatDate(allData[startDateIndex]!.date, true) }}
      </div>
    </div>
  </div>
  <UModal v-model:open="embedModalOpen">
    <template #content>
      <div class="p-4">
        <div class="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
          Copy the code below to embed the chart on your website.
        </div>
        <UTextarea :value="iframeEmbed" class="mb-4 w-full" autoresize />
        <UButton :color="copiedEmbed ? 'success' : 'neutral'" :variant="copiedEmbed ? 'subtle' : 'solid'" :icon="copiedEmbed ? 'i-lucide-check' : 'i-lucide-copy'" size="xs" :label="copiedEmbed ? 'Copied!' : 'Copy embed code'" @click="copyEmbed()" class="ml-1" />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: #fff;

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
    --vis-crosshair-circle-stroke-color: var(--ui-color-neutral-900);

    --vis-axis-grid-color: var(--ui-color-neutral-800);
    --vis-axis-tick-color: var(--ui-color-neutral-800);
    --vis-axis-tick-label-color: var(--ui-color-neutral-500);

    --vis-tooltip-background-color: var(--ui-color-neutral-900);
    --vis-tooltip-border-color: var(--ui-color-neutral-800);
    --vis-tooltip-text-color: #fff;
    --vis-annotation-text-color: var(--ui-primary);
  }
}
</style>
