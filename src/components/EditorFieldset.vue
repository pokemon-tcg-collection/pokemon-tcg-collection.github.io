<script setup lang="ts">
const { label } = defineProps<{ label: string }>()
</script>

<template>
  <fieldset class="pa-3 my-2">
    <legend>{{ label }}</legend>
    <slot></slot>
  </fieldset>
</template>

<style lang="css" scoped>
fieldset > legend {
  padding-inline: 0.3rem;
}
</style>
