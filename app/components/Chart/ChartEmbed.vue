<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  iframeEmbed: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { copy, copied } = useClipboard({ source: computed(() => props.iframeEmbed) })
</script>

<template>
  <UModal :open="modelValue" @update:open="emit('update:modelValue', $event)" title="Embed Chart">
    <template #content>
      <div class="p-4">
        <div class="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
          Copy the code below to embed the chart on your website.
        </div>
        <UTextarea :value="iframeEmbed" class="mb-4 w-full" autoresize />
        <UButton
          :color="copied ? 'success' : 'neutral'"
          :variant="copied ? 'subtle' : 'solid'"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          size="xs"
          :label="copied ? 'Copied!' : 'Copy embed code'"
          @click="copy()"
          class="ml-1"
        />
      </div>
    </template>
  </UModal>
</template>
