<script setup lang="ts">
import { computed } from 'vue'

import { CARD_LANGUAGES, ITEM_TYPES } from '@/model/interfaces'
import { useItemsStore } from '@/stores/items'

const itemsStore = useItemsStore()

function languageById(id: string | undefined) {
  if (id === undefined) return undefined
  return CARD_LANGUAGES.find((language) => language.code === id)?.short
}
function itemTypeById(id: string | undefined) {
  if (id === undefined) return undefined
  return ITEM_TYPES.find((item) => item.id === id)?.label ?? id
}

const items = computed(() =>
  Array.from(itemsStore.items.values()).map((item) => ({
    id: item.id,
    type: itemTypeById(item.type),
    language: languageById(item.language),
    name: item.name,
    item,
  })),
)
</script>

<template>
  <h1 class="mb-3">Item List</h1>

  <v-row class="mb-1 align-center">
    <v-col>{{ items.length }} Items</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'item-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-table striped="even" fixed-header density="compact">
    <thead>
      <tr>
        <th scope="col">Type</th>
        <th scope="col">Name</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td class="fit">{{ item.type }}</td>
        <td class="">
          <template v-if="item.language">[{{ item.language }}] </template>{{ item.name }}
        </td>
        <td class="fit">
          <v-btn-group density="compact" variant="text">
            <v-btn :to="{ name: 'item-edit', params: { id: item.id } }" prepend-icon="mdi-file-edit"
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
