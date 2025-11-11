<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min: number
  max: number
  startDate?: Date
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date)
}
</script>

<template>
  <div class="mt-2">
    <USlider
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      :min="min"
      :max="max"
      :step="1"
      size="xs"
    />
    <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-2" v-if="startDate">
      Start at {{ formatDate(startDate) }}
    </div>
  </div>
</template>
