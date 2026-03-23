<script setup lang="ts">
import { computed } from 'vue'
import type { DataTableHeader, DataTableSortItem } from 'vuetify'

import type { Place, PlaceLocalFair, PlaceOnlineMarketplace } from '@/model/interfaces'
import { ONLINE_MARKETPLACE, PLACE_TYPE } from '@/model/interfaces'
import { usePlacesStore } from '@/stores/places'
import { useTransactionsStore } from '@/stores/transactions'

const placesStore = usePlacesStore()
const transactionsStore = useTransactionsStore()

interface PlaceItem {
  id: string
  type: 'local-store' | 'local-fair' | 'online-shop' | 'online-marketplace'
  name: string
  num_transactions: number
  place: Place
}
const places = computed(
  () =>
    Array.from(placesStore.places.values())
      .map((place) => {
        return {
          id: place.id,
          type: place.type,
          name: place.name,
          num_transactions: Array.from(transactionsStore.transactions.values()).filter(
            (transaction) => transaction.place_id === place.id,
          ).length,
          place: place,
        }
      })
      .sort((a, b) => b.num_transactions - a.num_transactions) as PlaceItem[],
)

// const groupBy = [{ key: 'type', order: 'asc' }]
const headers: DataTableHeader[] = [
  // { key: 'data-table-group', title: 'Type' },
  {
    title: 'Type',
    key: 'type',
    value: (item) => PLACE_TYPE.find((pt) => pt.id === item.type)?.label ?? item.type,
    minWidth: 'fit-content',
    width: 0,
    cellProps: {
      style: { whiteSpace: 'nowrap' },
    },
  },
  {
    title: 'Name',
    key: 'name',
    value: (item) => {
      if (item.place.type === 'online-marketplace') {
        const marketplace = ONLINE_MARKETPLACE.find(
          (mp) => mp.id === (item.place as PlaceOnlineMarketplace).marketplace,
        )?.label
        if (marketplace) {
          return `[${marketplace}] ${item.name}`
        }
      } else if (item.place.type === 'local-fair') {
        const fairPlace = (item.place as PlaceLocalFair).fair
        if (fairPlace) {
          return `[${fairPlace}] ${item.name}`
        }
      }
      return item.name
    },
    width: 'max-content',
  },
  {
    title: '#\xA0TX',
    key: 'num_transactions',
    align: 'end',
    minWidth: 'fit-content',
    width: 0,
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    minWidth: 'fit-content',
    width: 0,
  },
]
const sortBy: DataTableSortItem[] = [{ key: 'num_transactions', order: 'desc' }]
</script>

<template>
  <h1 class="mb-3">Place / Location List</h1>

  <v-row class="mb-3 align-center">
    <v-col>{{ places.length }} Places</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'place-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-data-table
    :headers="headers"
    :items="places"
    item-key="id"
    :sort-by="sortBy"
    :multi-sort="{ mode: 'append', key: 'ctrl' }"
    :hide-default-footer="places.length < 11"
    density="compact"
    striped="even"
  >
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.actions="{ item }">
      <v-btn-group density="compact" variant="text">
        <v-btn :to="{ name: 'place-edit', params: { id: item.id } }" prepend-icon="mdi-file-edit"
          >Edit</v-btn
        >
      </v-btn-group>
    </template>
  </v-data-table>
</template>
