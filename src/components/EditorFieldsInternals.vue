<script setup lang="ts">
import type { Base } from '@/model/interfaces'
import { useSettingsStore } from '@/stores/settings'

const object = defineModel<Base>('object', { required: true })

const settings = useSettingsStore()
</script>

<template>
  <fieldset class="pa-3 my-2">
    <legend>Internals</legend>

    <v-text-field
      v-if="settings.editorShowInternalID"
      :model-value="object.id"
      readonly
      label="Internal Object ID"
    ></v-text-field>

    <v-text-field
      :model-value="new Date(object._meta.created).toLocaleString()"
      readonly
      label="Creation date"
    ></v-text-field>
    <v-text-field
      v-if="object._meta.edited !== undefined"
      :model-value="new Date(object._meta.edited).toLocaleString()"
      readonly
      label="Edit date (last modification)"
    ></v-text-field>
  </fieldset>
</template>

<style lang="css" scoped>
fieldset > legend {
  padding-inline: 0.3rem;
}
</style>
