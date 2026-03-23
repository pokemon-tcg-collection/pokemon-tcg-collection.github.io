<script setup lang="ts">
import { computed } from 'vue'
import type { DataTableHeader, DataTableSortItem } from 'vuetify'

import type { Item } from '@/model/interfaces'
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

interface ItemItem {
  id: string
  type: string
  language: string
  name: string
  item: Item
}
const items = computed(
  () =>
    Array.from(itemsStore.items.values()).map((item) => {
      return {
        id: item.id,
        type: itemTypeById(item.type),
        language: languageById(item.language),
        name: item.name,
        item: item,
      }
    }) as ItemItem[],
)

const headers: DataTableHeader[] = [
  {
    title: 'Type',
    key: 'type',
    minWidth: 'fit-content',
    width: 0,
    cellProps: {
      style: { whiteSpace: 'nowrap' },
    },
  },
  {
    title: 'Language',
    key: 'language',
    minWidth: 'fit-content',
    width: 0,
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
  <h1 class="mb-3">Item List</h1>

  <v-row class="mb-3 align-center">
    <v-col>{{ items.length }} Items</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'item-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-data-table
    :headers="headers"
    :items="items"
    item-key="id"
    :sort-by="sortBy"
    :multi-sort="{ mode: 'append', key: 'ctrl' }"
    :hide-default-footer="items.length < 11"
    density="compact"
    striped="even"
  >
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.actions="{ item }">
      <v-btn-group density="compact" variant="text">
        <v-btn :to="{ name: 'item-edit', params: { id: item.id } }" prepend-icon="mdi-file-edit"
          >Edit</v-btn
        >
      </v-btn-group>
    </template>
  </v-data-table>
</template>
