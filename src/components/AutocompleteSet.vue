<script setup lang="ts">
import { computed } from 'vue'

import type { RefID, Set } from '@/model/interfaces'
import { useSetsStore } from '@/stores/sets'

const model = defineModel<RefID | undefined>()

const emit = defineEmits<{
  addNewSet: []
}>()

const setsStore = useSetsStore()

// TODO: include series, maybe with symbols/logos or stats
const set_ids = computed<{ id: string; label: string; set: Set }[]>(() =>
  (Array.from(setsStore.sets.values()) as Set[]).map((set) => ({
    id: set.id,
    label: set.name,
    set,
  })),
)

function onAddNewSet() {
  emit('addNewSet')
}
</script>

<template>
  <v-autocomplete
    v-model="model"
    :items="set_ids"
    item-title="label"
    item-value="id"
    clearable
    label="Set"
  >
    <template #no-data>
      <v-list-item @click="onAddNewSet">Add new Set</v-list-item>
    </template>
  </v-autocomplete>
</template>
