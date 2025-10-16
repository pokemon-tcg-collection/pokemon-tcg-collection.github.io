<script setup lang="ts">
import OverviewLinkCard from '@/components/OverviewLinkCard.vue'
import OverviewLinkCardContainer from '@/components/OverviewLinkCardContainer.vue'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useTransactionsStore } from '@/stores/transactions'

const cardsStore = useCardsStore()
const transactionsStore = useTransactionsStore()
const placesStore = usePlacesStore()
const itemsStore = useItemsStore()
</script>

<template>
  <h1 class="mb-5">Home</h1>

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
      icon="mdi-invoice-list"
      title="Transaction List"
      :to="{ name: 'transaction-list' }"
      to-label="See Transactions list"
    >
      {{ transactionsStore.transactions.size }} recorded Transactions.
    </OverviewLinkCard>

    <OverviewLinkCard
      icon="mdi-map-marker-multiple"
      title="Place List"
      :to="{ name: 'place-list' }"
      to-label="See Places list"
    >
      {{ placesStore.places.size }} known Places.
    </OverviewLinkCard>

    <OverviewLinkCard
      icon="mdi-receipt-text"
      title="Item List"
      :to="{ name: 'item-list' }"
      to-label="See Items list"
    >
      {{ itemsStore.items.size }} known Items.
    </OverviewLinkCard>
  </OverviewLinkCardContainer>
</template>
