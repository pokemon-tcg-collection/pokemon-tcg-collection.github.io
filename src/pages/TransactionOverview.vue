<script setup lang="ts">
import OverviewLinkCard from '@/components/OverviewLinkCard.vue'
import OverviewLinkCardContainer from '@/components/OverviewLinkCardContainer.vue'
</script>

<template>
  <h1 class="mb-5">Transactions</h1>

  <overview-link-card-container>
    <overview-link-card
      icon="mdi-invoice-list"
      title="Transaction List"
      :to="{ name: 'transaction-list' }"
      to-label="See Transactions list"
    >
      The list of your transactions.
    </overview-link-card>
    <overview-link-card
      icon="mdi-pencil-plus"
      title="New Transaction"
      :to="{ name: 'transaction-new' }"
      to-label="Add a new transaction."
    >
      The list of your transactions.
    </overview-link-card>
  </overview-link-card-container>
</template>
