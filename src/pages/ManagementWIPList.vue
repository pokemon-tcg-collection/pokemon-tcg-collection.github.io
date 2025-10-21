<script setup lang="ts">
import { computed, triggerRef } from 'vue'
import { toRaw } from 'vue'
import { storeToRefs } from 'pinia'

import { useWorkInProgressStore, type WIPObject } from '@/stores/workInProgress'

const wipStore = useWorkInProgressStore()

const { objects: wipObjectRef } = storeToRefs(wipStore)
const wipObjects = computed(() =>
  Array.from(wipObjectRef.value.values()).map((wipObject) => ({
    id: wipObject.id,
    name:
      wipObject.type === 'transaction-edit'
        ? 'Transaction'
        : wipObject.type === 'card-edit'
          ? 'Card'
          : wipObject.type === 'place-edit'
            ? 'Place'
            : wipObject.type === 'item-edit'
              ? 'Item'
              : wipObject.type,
    wipObject,
  })),
)

async function onDeleteDraftObject(obj: WIPObject) {
  console.log('Delete WIP object', toRaw(obj))

  await wipStore.remove(obj.id)
  triggerRef(wipObjectRef)
}
</script>

<template>
  <h1 class="mb-3">Works in Progress</h1>

  <p class="mb-3">{{ wipObjectRef.size }} unfinished edits</p>

  <v-table v-if="wipObjectRef.size > 0" striped="even" fixed-header density="compact">
    <thead>
      <tr>
        <th scope="col">Date</th>
        <th scope="col">Type</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="wipObject in wipObjects" :key="wipObject.id">
        <td class="fit">
          {{ wipObject.wipObject.date ? new Date(wipObject.wipObject.date).toLocaleString() : '–' }}
        </td>
        <td class="stretch">{{ wipObject.name }}</td>
        <td class="fit">
          <v-btn-group density="compact" variant="text">
            <v-btn
              :to="{ name: wipObject.wipObject.type, params: { id: wipObject.wipObject.id } }"
              prepend-icon="mdi-file-edit"
              >Edit</v-btn
            >
            <v-btn
              prepend-icon="mdi-file-document-remove"
              @click="() => onDeleteDraftObject(wipObject.wipObject)"
              >Delete</v-btn
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
