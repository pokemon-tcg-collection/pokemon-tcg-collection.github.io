<script setup lang="ts">
import EditorFieldset from '@/components/EditorFieldset.vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
</script>

<template>
  <h1 class="mb-3">Application Settings</h1>

  <v-form>
    <EditorFieldset label="Editor (debug options)">
      <p class="text-medium-emphasis">
        Changing the following checkboxes will take effect immediately.
      </p>

      <v-checkbox
        v-model="settings.editorShowInternalID"
        hide-details
        label="Show internal identifiers"
      ></v-checkbox>

      <v-checkbox
        v-model="settings.editorShowObjectInternals"
        hide-details
        label="Show object internals (creation/modification time, ID)"
      ></v-checkbox>
      <v-checkbox
        v-model="settings.editorShowObjectRelations"
        hide-details
        label="Show object relations (in-/outgoing)"
      ></v-checkbox>
    </EditorFieldset>
  </v-form>
</template>
