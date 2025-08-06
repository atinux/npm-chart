<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})
</script>

<template>
  <ClientOnly v-if="!colorMode?.forced">
    <USwitch
      v-bind="$attrs"
      v-model="isDark"
      size="sm"
      checked-icon="i-heroicons-moon"
      unchecked-icon="i-heroicons-sun"
      :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
    />

    <template #fallback>
      <USwitch
        size="sm"
        v-bind="$attrs"
        checked-icon="i-heroicons-moon"
        unchecked-icon="i-heroicons-sun"
        :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
        disabled
      />
    </template>
  </ClientOnly>
</template>
