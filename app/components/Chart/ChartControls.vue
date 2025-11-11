<script setup lang="ts">
const props = defineProps<{
  periodSelected: Period
  downloading: boolean
  copied: boolean
  downloadDropdownOpen: boolean
}>()

const emit = defineEmits<{
  'update:periodSelected': [value: Period]
  'update:downloadDropdownOpen': [value: boolean]
  download: [type: 'png' | 'svg']
  copy: []
  openEmbed: []
  openCustomize: []
}>()

const downloadsItems = computed(() => [[
  { icon: 'i-ph-file-png-light', label: 'Save as PNG', onSelect: () => emit('download', 'png') },
  { icon: 'i-ph-file-svg-light', label: 'Save as SVG', onSelect: () => emit('download', 'svg') },
]])
</script>

<template>
  <div class="flex items-center gap-2">
    <UTabs
      :items="[{ label: 'month', value: 'monthly' }, { label: 'week', value: 'weekly' }]"
      color="neutral"
      :model-value="periodSelected"
      @update:model-value="emit('update:periodSelected', $event)"
      size="sm"
      :ui="{
        root: 'h-7',
        list: 'p-0.25 bg-transparent',
        indicator: 'bg-white dark:bg-neutral-800',
        trigger: 'data-[state=active]:text-default data-[state=inactive]:text-muted'
      }"
    />
    <UDropdownMenu
      :model-value="downloadDropdownOpen"
      @update:model-value="emit('update:downloadDropdownOpen', $event)"
      :items="downloadsItems"
      size="sm"
    >
      <UTooltip text="Download chart" :popper="{ placement: 'top' }">
        <UButton variant="link" color="neutral" icon="i-heroicons-camera" size="sm" :padded="false" aria-label="Download chart" :loading="downloading" />
      </UTooltip>
    </UDropdownMenu>
    <UTooltip :text="copied ? 'URL copied' : 'Share chart'" :popper="{ placement: 'top' }">
      <UButton variant="link" color="neutral" :icon="copied ? 'i-heroicons-check' : 'i-heroicons-link'" size="xs" :padded="false" aria-label="Share chart" @click="emit('copy')" class="ml-1" />
    </UTooltip>
    <UTooltip text="Embed chart" :popper="{ placement: 'top' }">
      <UButton variant="link" color="neutral" icon="i-heroicons-code-bracket" size="xs" :padded="false" aria-label="Embed chart" @click="emit('openEmbed')" class="ml-1" />
    </UTooltip>
    <UTooltip text="Customize chart" :popper="{ placement: 'top' }">
      <UButton variant="link" color="neutral" icon="i-heroicons-cog-6-tooth" size="xs" :padded="false" aria-label="Customize chart" @click="emit('openCustomize')" class="ml-1" />
    </UTooltip>
  </div>
</template>
