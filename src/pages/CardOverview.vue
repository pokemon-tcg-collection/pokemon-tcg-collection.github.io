<script setup lang="ts">
import OverviewLinkCard from '@/components/OverviewLinkCard.vue'
import OverviewLinkCardContainer from '@/components/OverviewLinkCardContainer.vue'
import { useCardsStore } from '@/stores/cards'

const cardsStore = useCardsStore()
</script>

<template>
  <h1 class="mb-5">Cards Overview</h1>

  <overview-link-card-container>
    <overview-link-card
      icon="mdi-cards"
      title="Card List"
      :to="{ name: 'card-list' }"
      to-label="See Card list"
    >
      {{ cardsStore.cards.size }} Cards in collection.
    </overview-link-card>
    <overview-link-card
      icon="mdi-pencil-plus"
      title="New Card"
      :to="{ name: 'card-new' }"
      to-label="Add a new Card"
    >
      Create a new Card to add to your collection.
    </overview-link-card>
  </overview-link-card-container>
</template>
