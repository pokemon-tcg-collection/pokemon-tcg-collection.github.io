<script setup lang="ts">
import { computed } from 'vue'

import { useSetsStore } from '@/stores/sets'

const setsStore = useSetsStore()

const sets = computed(() =>
  Array.from(setsStore.sets.values()).map((set) => ({
    id: set.id,
    name: set.name,
    set,
  })),
)
</script>

<template>
  <h1 class="mb-3">Set List</h1>

  <v-row class="mb-1 align-center">
    <v-col>{{ sets.length }} Sets</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'set-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-table striped="even" fixed-header density="compact">
    <thead>
      <tr>
        <th scope="col">Series</th>
        <th scope="col">Name</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="set in sets" :key="set.id">
        <td class="fit">{{ set.set.series }}</td>
        <td class="">{{ set.name }}</td>
        <td class="fit">
          <v-btn-group density="compact" variant="text">
            <v-btn :to="{ name: 'set-edit', params: { id: set.id } }" prepend-icon="mdi-file-edit"
              >Edit</v-btn
            >
          </v-btn-group>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<style lang="css" scoped>
tr > td {
  /* max-width: 0; */
  overflow: hidden;
  text-overflow: ellipsis;
}
tr > td.fit {
  min-width: fit-content;
  width: 0;
  white-space: nowrap;
}
</style>
