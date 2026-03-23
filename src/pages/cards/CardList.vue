<script setup lang="ts">
import { computed } from 'vue'
import type { DataTableHeader, DataTableSortItem } from 'vuetify'

import { useCardsStore } from '@/stores/cards'

const cardsStore = useCardsStore()

const cards = computed(() =>
  Array.from(cardsStore.cards.values()).map((card) => ({
    id: card.id,
    name: card.name,
    card: card,
  })),
)

const headers: DataTableHeader[] = [
  {
    title: '∑',
    key: 'card.amount',
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
  <h1 class="mb-3">Card List</h1>

  <v-row class="mb-3 align-center">
    <v-col>{{ cards.length }} Cards</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'card-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-data-table
    :headers="headers"
    :items="cards"
    item-key="id"
    :sort-by="sortBy"
    :multi-sort="{ mode: 'append', key: 'ctrl' }"
    :hide-default-footer="cards.length < 11"
    density="compact"
    striped="even"
  >
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.card.amount="{ item: card }">
      <v-chip class="me-2">{{ card.card.amount }}x</v-chip>
    </template>

    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.actions="{ item: card }">
      <v-btn-group density="compact" variant="text">
        <v-btn :to="{ name: 'card', params: { id: card.id } }" prepend-icon="mdi-file-eye"
          >View</v-btn
        >
        <v-btn :to="{ name: 'card-edit', params: { id: card.id } }" prepend-icon="mdi-file-edit"
          >Edit</v-btn
        >
      </v-btn-group>
    </template>
  </v-data-table>

  <!-- <v-row>
    <v-col v-for="card in cards" :key="card.id" cols="3">
      <v-card height="200" class="d-flex flex-column">
        <v-card-title>{{ card.name }}</v-card-title>
        <v-spacer></v-spacer>
        <v-card-actions>
          <v-btn :to="{ name: 'card', params: { id: card.id } }">Card Details</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row> -->
</template>
