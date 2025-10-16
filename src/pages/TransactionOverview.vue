<script setup lang="ts">
import OverviewLinkCard from '@/components/OverviewLinkCard.vue'
import OverviewLinkCardContainer from '@/components/OverviewLinkCardContainer.vue'
</script>

<template>
  <h1 class="mb-5">Transactions</h1>

  <OverviewLinkCardContainer>
    <OverviewLinkCard
      icon="mdi-invoice-list"
      title="Transaction List"
      :to="{ name: 'transaction-list' }"
      to-label="See Transactions list"
    >
      The list of your transactions.
    </OverviewLinkCard>
    <OverviewLinkCard
      icon="mdi-pencil-plus"
      title="New Transaction"
      :to="{ name: 'transaction-new' }"
      to-label="Add a new transaction"
    >
      Record any purchase or sale.
    </OverviewLinkCard>
  </OverviewLinkCardContainer>

  <OverviewLinkCardContainer>
    <OverviewLinkCard
      icon="mdi-map-marker-multiple"
      title="Place List"
      :to="{ name: 'place-list' }"
      to-label="See Places list"
    >
      The list of known places (websites, stores).
    </OverviewLinkCard>
    <OverviewLinkCard
      icon="mdi-pencil-plus"
      title="New Place"
      :to="{ name: 'place-new' }"
      to-label="Add a new place"
    >
      Place where transactions happened.
    </OverviewLinkCard>
  </OverviewLinkCardContainer>

  <OverviewLinkCardContainer>
    <OverviewLinkCard
      icon="mdi-receipt-text"
      title="Item List"
      :to="{ name: 'item-list' }"
      to-label="See Item list"
    >
      The list of item types.
    </OverviewLinkCard>
    <OverviewLinkCard
      icon="mdi-pencil-plus"
      title="New Item"
      :to="{ name: 'item-new' }"
      to-label="Add a new item"
    >
      A booster, display, or other type of merchandise.
    </OverviewLinkCard>
  </OverviewLinkCardContainer>
</template>
