<script setup lang="ts">
import { useDisplay } from 'vuetify'

import OverviewLinkCard from '@/components/OverviewLinkCard.vue'
import OverviewLinkCardContainer from '@/components/OverviewLinkCardContainer.vue'
import useItemsStats from '@/composables/useItemsStats'
import usePlacesStats from '@/composables/usePlacesStats'
import useTransactionsStats from '@/composables/useTransactionsStats'
import { formatCurrencyNumber } from '@/utils/locale'

const { smAndDown } = useDisplay()

const { numTransactions, sumSpent, sumEarned, sumTotal, unit } = useTransactionsStats()
const { numPlaces, numOnline, numLocal } = usePlacesStats()
const { numItems, numItemsPerTypeType } = useItemsStats()
</script>

<template>
  <h1 class="d-sr-only">Transactions</h1>

  <v-sheet elevation="2" class="mt-5 mb-5 mx-auto px-4" rounded="lg">
    <v-row class="d-flex justify-space-around gr-0">
      <v-col
        cols="12"
        md="4"
        class="px-6 py-3 d-flex flex-column ga-2"
        :class="{ ['border-b-md']: smAndDown }"
      >
        <p class="text-title-medium text-center my-0">Transactions</p>
        <p class="text-display-medium text-center my-0">
          # <span class="font-weight-bold">{{ numTransactions }}</span>
        </p>
        <div>
          <p class="text-headline-small pe-lg-4 d-flex flex-nowrap my-0 gc-2 justify-space-between">
            <span class="font-weight-light">Spent</span>
            <span>
              <span class="font-weight-bold text-red-darken-3">{{
                formatCurrencyNumber(sumSpent)
              }}</span>
              {{ unit }}
            </span>
          </p>
          <p class="text-headline-small pe-lg-4 d-flex flex-nowrap my-0 gc-2 justify-space-between">
            <span class="font-weight-light">Earned</span>
            <span
              ><span class="font-weight-bold text-green-darken-3">{{
                formatCurrencyNumber(sumEarned)
              }}</span>
              {{ unit }}</span
            >
          </p>
          <p class="text-headline-small pe-lg-4 d-flex flex-nowrap my-0 gc-2 justify-space-between">
            <span class="font-weight-light">Total</span>
            <span>
              <span
                :class="{
                  ['font-weight-bold']: true,
                  ['text-green-darken-3']: sumTotal > 0,
                  ['text-red-darken-3']: sumTotal < 0,
                }"
                >{{ formatCurrencyNumber(sumTotal) }}</span
              >
              {{ unit }}
            </span>
          </p>
        </div>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="px-6 py-3 d-flex flex-column ga-2"
        :class="{ ['border-b-md']: smAndDown }"
      >
        <p class="text-title-medium text-center my-0">Places</p>
        <p class="text-display-medium text-center my-0">
          # <span class="font-weight-bold">{{ numPlaces }}</span>
        </p>
        <div>
          <p class="text-headline-small pe-lg-4 d-flex flex-nowrap my-0 gc-2 justify-space-between">
            <span class="font-weight-light">Online</span>
            <span>
              <span class="font-weight-bold text-yellow-darken-2">{{ numOnline }}</span>
            </span>
          </p>
          <p class="text-headline-small pe-lg-4 d-flex flex-nowrap my-0 gc-2 justify-space-between">
            <span class="font-weight-light">Local</span>
            <span>
              <span class="font-weight-bold text-light-blue-darken-4">{{ numLocal }}</span>
            </span>
          </p>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="px-6 py-3 d-flex flex-column ga-2">
        <p class="text-title-medium text-center my-0">Items</p>
        <p class="text-display-medium text-center my-0">
          # <span class="font-weight-bold">{{ numItems }}</span>
        </p>
        <div>
          <p
            v-for="[type, amount] in numItemsPerTypeType.entries()"
            :key="type"
            class="text-headline-small pe-lg-4 d-flex flex-nowrap my-0 gc-2 justify-space-between"
          >
            <span class="font-weight-light">{{
              type.slice(0, 1).toUpperCase() + type.slice(1)
            }}</span>
            <span>
              <span class="font-weight-bold">{{ amount }}</span>
            </span>
          </p>
        </div>
      </v-col>
    </v-row>
  </v-sheet>

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
      icon="mdi-map-marker-multiple"
      title="Place List"
      :to="{ name: 'place-list' }"
      to-label="See Places list"
    >
      The list of known places (websites, stores).
    </OverviewLinkCard>

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
      title="New Transaction"
      :to="{ name: 'transaction-new' }"
      to-label="Add a new transaction"
    >
      Record any purchase or sale.
    </OverviewLinkCard>

    <OverviewLinkCard
      icon="mdi-pencil-plus"
      title="New Place"
      :to="{ name: 'place-new' }"
      to-label="Add a new place"
    >
      Place where transactions happened.
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
