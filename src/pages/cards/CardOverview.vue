<script setup lang="ts">
import OverviewLinkCard from '@/components/OverviewLinkCard.vue'
import OverviewLinkCardContainer from '@/components/OverviewLinkCardContainer.vue'
import { useCardsStore } from '@/stores/cards'
import { useSetsStore } from '@/stores/sets'

const cardsStore = useCardsStore()
const setsStore = useSetsStore()
</script>

<template>
  <h1 class="mb-5">Cards and Sets</h1>

  <OverviewLinkCardContainer>
    <OverviewLinkCard
      icon="mdi-cards"
      title="Card List"
      :to="{ name: 'card-list' }"
      to-label="See Card list"
    >
      {{ cardsStore.cards.size }} Cards in collection.
    </OverviewLinkCard>

    <OverviewLinkCard
      icon="mdi-cards-variant"
      title="Set List"
      :to="{ name: 'set-list' }"
      to-label="See Set list"
    >
      {{ setsStore.sets.size }} Sets.
    </OverviewLinkCard>

    <OverviewLinkCard
      icon="mdi-pencil-plus"
      title="New Card"
      :to="{ name: 'card-new' }"
      to-label="Add a new Card"
    >
      Create a new Card to add to your collection.
    </OverviewLinkCard>

    <OverviewLinkCard
      icon="mdi-pencil-plus"
      title="New Set"
      :to="{ name: 'set-new' }"
      to-label="Add a new Set"
    >
      Create a new Set.
    </OverviewLinkCard>
  </OverviewLinkCardContainer>
</template>
