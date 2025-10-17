<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
</script>

<template>
  <h1 class="mb-3">Application Settings</h1>

  <v-form>
    <fieldset class="pa-3 my-2">
      <legend>Debug Settings</legend>
      <p class="text-medium-emphasis">
        Changing the following checkboxes will take effect immediately.
      </p>

      <v-checkbox
        v-model="settings.editorShowInternalID"
        hide-details
        label="Show internal identifiers in editors"
      ></v-checkbox>
    </fieldset>
  </v-form>
</template>

<style lang="css" scoped>
fieldset > legend {
  padding-inline: 0.3rem;
}
</style>
