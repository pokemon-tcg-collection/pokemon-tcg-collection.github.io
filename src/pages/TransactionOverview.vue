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
    </OverviewLinkCard>
  </OverviewLinkCardContainer>
</template>
