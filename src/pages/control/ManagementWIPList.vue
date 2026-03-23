<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, toRaw, triggerRef } from 'vue'
import type { DataTableHeader, DataTableSortItem } from 'vuetify'

import type { WIPObject } from '@/stores/workInProgress'
import { useWorkInProgressStore } from '@/stores/workInProgress'
import { sortDates } from '@/utils/sorting'

const wipStore = useWorkInProgressStore()

const { objects: wipObjectRef } = storeToRefs(wipStore)
const wipObjects = computed(() =>
  Array.from(wipObjectRef.value.values()).map((wipObject) => ({
    id: wipObject.id,
    typeName:
      wipObject.type === 'transaction-edit'
        ? 'Transaction'
        : wipObject.type === 'card-edit'
          ? 'Card'
          : wipObject.type === 'place-edit'
            ? 'Place'
            : wipObject.type === 'item-edit'
              ? 'Item'
              : wipObject.type,
    label: wipObject.data.name,
    wipObject,
  })),
)

const headers: DataTableHeader[] = [
  {
    title: 'Date',
    key: 'transaction.date',
    value: (item) =>
      item.wipObject.date ? new Date(item.wipObject.date).toLocaleDateString() : '–',
    sortRaw: (a, b) => sortDates(a.wipObject.date, b.wipObject.date),
    cellProps: ({ item }) => ({
      title: item.wipObject.date,
    }),
    minWidth: 'fit-content',
    width: 0,
  },
  {
    title: 'Type',
    key: 'typeName',
    minWidth: 'fit-content',
    width: 0,
  },
  {
    title: 'Name',
    key: 'label',
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

async function onDeleteDraftObject(obj: WIPObject) {
  console.log('Delete WIP object', toRaw(obj))

  await wipStore.remove(obj.id)
  triggerRef(wipObjectRef)
}
</script>

<template>
  <h1 class="mb-3">Works in Progress</h1>

  <p class="mb-3">{{ wipObjectRef.size }} unfinished edits</p>

  <v-data-table
    v-if="wipObjectRef.size > 0"
    :headers="headers"
    :items="wipObjects"
    item-key="id"
    :sort-by="sortBy"
    :multi-sort="{ mode: 'append', key: 'ctrl' }"
    :hide-default-footer="wipObjects.length < 11"
    density="compact"
    striped="even"
  >
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.actions="{ item }">
      <v-btn-group density="compact" variant="text">
        <v-btn
          :to="{ name: item.wipObject.type, params: { id: item.wipObject.id } }"
          prepend-icon="mdi-file-edit"
          >Edit</v-btn
        >
        <v-btn
          prepend-icon="mdi-file-document-remove"
          @click="() => onDeleteDraftObject(item.wipObject as WIPObject)"
          >Delete</v-btn
        >
      </v-btn-group>
    </template>
  </v-data-table>
</template>
