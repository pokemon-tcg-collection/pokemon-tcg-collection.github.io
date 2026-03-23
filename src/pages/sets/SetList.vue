<script setup lang="ts">
import { computed } from 'vue'
import type { DataTableHeader, DataTableSortItem } from 'vuetify'

import { useSetsStore } from '@/stores/sets'

const setsStore = useSetsStore()

const sets = computed(() =>
  Array.from(setsStore.sets.values()).map((set) => ({
    id: set.id,
    name: set.name,
    set,
  })),
)

const headers: DataTableHeader[] = [
  {
    title: 'Series',
    key: 'set.series',
    width: 'max-content',
  },
  {
    title: 'Name',
    key: 'name',
    width: 'max-content',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    minWidth: 'fit-content',
    width: 0,
  },
]
const sortBy: DataTableSortItem[] = []
</script>

<template>
  <h1 class="mb-3">Set List</h1>

  <v-row class="mb-3 align-center">
    <v-col>{{ sets.length }} Sets</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'set-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-data-table
    :headers="headers"
    :items="sets"
    item-key="id"
    :sort-by="sortBy"
    :multi-sort="{ mode: 'append', key: 'ctrl' }"
    :hide-default-footer="sets.length < 11"
    density="compact"
    striped="even"
  >
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.actions="{ item }">
      <v-btn-group density="compact" variant="text">
        <v-btn :to="{ name: 'set-edit', params: { id: item.id } }" prepend-icon="mdi-file-edit"
          >Edit</v-btn
        >
      </v-btn-group>
    </template>
  </v-data-table>
</template>
