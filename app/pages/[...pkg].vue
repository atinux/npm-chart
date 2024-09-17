<script setup lang="ts">
const pkg = useRoute().params.pkg.join('/')
const { data } = await useFetch(`/api/${pkg}`)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Package not found.' })
}
</script>

<template>
  <div>
    <div class="flex justify-between">
      <UButton
        to="/"
        variant="link"
        :padded="false"
        color="gray"
        icon="i-heroicons-magnifying-glass"
        class="opacity-70 hover:opacity-100"
        size="xs"
      >
        Search another package
      </UButton>
      <ColorPicker />
    </div>
    <h1 class="text-2xl font-bold">
      {{ data.name }} <a class="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400" :href="`https://npmjs.com/package/${data.name}`" target="_blank">
        v{{ data.version }}
      </a>
    </h1>
    <p>{{ data.description }}</p>
    <a :href="data.homepage" target="_blank" class="text-primary hover:underline">
      {{ data.homepage.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
    </a>

    <div class="mt-4">
      <ClientOnly>
        <NPMChart :data="data.downloads" />
      </ClientOnly>
    </div>
  </div>
</template>
