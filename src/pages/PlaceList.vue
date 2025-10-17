<script setup lang="ts">
import { computed } from 'vue'

import { usePlacesStore } from '@/stores/places'
import { useTransactionsStore } from '@/stores/transactions'

const placesStore = usePlacesStore()
const transactionsStore = useTransactionsStore()

const places = computed(() =>
  Array.from(placesStore.places.values()).map((place) => ({
    id: place.id,
    name: place.name,
    place,
    transactions: Array.from(transactionsStore.transactions.values()).filter(
      (transaction) => transaction.place_id === place.id,
    ).length,
  })),
)
</script>

<template>
  <h1 class="mb-3">Place / Location List</h1>

  <v-row class="mb-1 align-center">
    <v-col>{{ places.length }} Places</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'place-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-table striped="even" fixed-header density="compact">
    <thead>
      <tr>
        <th scope="col">Type</th>
        <th scope="col">Name</th>
        <th scope="col">#&nbsp;Transactions</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="place in places" :key="place.id">
        <td class="fit">{{ place.place.type }}</td>
        <td class="">{{ place.place.name }}</td>
        <td class="fit text-right">{{ place.transactions }}</td>
        <td class="fit">
          <v-btn-group density="compact" variant="text">
            <v-btn
              :to="{ name: 'place-edit', params: { id: place.id } }"
              prepend-icon="mdi-file-edit"
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
