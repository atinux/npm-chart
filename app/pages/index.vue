<script setup lang="ts">
const pkg = ref('')
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold uppercase">
      NPM Chart
    </h1>
    <form class="flex gap-1 mt-4" @submit.prevent="$router.push(`/${pkg}`)">
      <UInput v-model="pkg" placeholder="npm package" autofocus />
      <UButton icon="i-heroicons-magnifying-glass" :disabled="!pkg" />
    </form>
    <div class="flex gap-1 mt-2">
      <UButton
        to="/vue"
        color="gray"
        label="vue"
        size="xs"
      />
      <UButton
        to="/react"
        color="gray"
        label="react"
        size="xs"
      />
      <UButton
        to="/svelte"
        color="gray"
        label="svelte"
        size="xs"
      />
      <UButton
        to="/angular"
        color="gray"
        label="angular"
        size="xs"
      />
    </div>
  </div>
</template>
