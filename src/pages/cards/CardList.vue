<script setup lang="ts">
import { computed } from 'vue'

import { useCardsStore } from '@/stores/cards'

const cardsStore = useCardsStore()

const cards = computed(() =>
  Array.from(cardsStore.cards.values()).map((card) => ({
    id: card.id,
    name: card.name,
    card: card,
  })),
)
</script>

<template>
  <h1 class="mb-3">Card List</h1>

  <v-row class="mb-1 align-center">
    <v-col>{{ cards.length }} Cards</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'card-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-list>
    <v-list-item v-for="card in cards" :key="card.id" link :title="card.name">
      <template #prepend>
        <v-chip class="me-2">{{ card.card.amount }}x</v-chip>
      </template>
      <template #append>
        <!-- <span>{{ card.card.set }}</span> -->
        <v-btn-group>
          <v-btn :to="{ name: 'card', params: { id: card.id } }" prepend-icon="mdi-file-eye"
            >View</v-btn
          >
          <v-btn :to="{ name: 'card-edit', params: { id: card.id } }" prepend-icon="mdi-file-edit"
            >Edit</v-btn
          >
        </v-btn-group>
      </template>
    </v-list-item>
  </v-list>
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
