<script setup lang="ts">
import { computed } from 'vue'

import type { CostUnits } from '@/model/interfaces'
import { useTransactionsStore } from '@/stores/transactions'

const transactionsStore = useTransactionsStore()

const transactions = computed(() =>
  Array.from(transactionsStore.transactions.values())
    .map((transaction) => ({
      id: transaction.id,
      name: transaction.name,
      transaction,
    }))
    // sort by date descending
    .sort((a, b) => {
      const dateA = a.transaction.date ? new Date(a.transaction.date) : undefined
      const dateB = b.transaction.date ? new Date(b.transaction.date) : undefined
      if (dateA === dateB) return 0
      if (dateA === undefined) return 1
      if (dateB === undefined) return 1
      return +dateB - +dateA
    }),
)

function costToEUR(cost: number, cost_unit: CostUnits) {
  // TODO: implement currency conversion
  if (cost_unit !== 'EUR') {
    console.warn('Non-EUR currency. Conversion required')
    return 0
  }
  return cost
}

const costs = computed(() =>
  transactions.value.map(
    (transaction) =>
      costToEUR(transaction.transaction.cost, transaction.transaction.cost_unit) *
      (transaction.transaction.type === 'buy' ? -1 : 1),
  ),
)
const sumSpent = computed(() =>
  costs.value.filter((cost) => cost < 0).reduce((sum, cost) => sum + cost, 0),
)
const sumEarned = computed(() =>
  costs.value.filter((cost) => cost > 0).reduce((sum, cost) => sum + cost, 0),
)
const sumTotal = computed(() => sumEarned.value + sumSpent.value)
</script>

<template>
  <h1 class="mb-3">List of Transaction</h1>

  <v-row class="mb-1 align-center">
    <v-col>{{ transactions.length }} Transactions</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'transaction-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-table striped="even" fixed-header density="compact">
    <thead>
      <tr>
        <th scope="col">Date</th>
        <th scope="col">Name</th>
        <th scope="col" class="text-right">Cost</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="transaction in transactions" :key="transaction.id">
        <td class="fit date">
          {{
            transaction.transaction.date
              ? new Date(transaction.transaction.date).toLocaleDateString()
              : '–'
          }}
        </td>
        <td class="stretch">{{ transaction.name ?? '–' }}</td>
        <td class="fit money" v-if="transaction.transaction.type">
          {{
            transaction.transaction.type === 'buy'
              ? '-'
              : transaction.transaction.type === 'sell'
                ? '+'
                : ''
          }}{{ transaction.transaction.cost }} {{ transaction.transaction.cost_unit }}
        </td>
        <td class="fit money" v-else>
          {{ transaction.transaction.cost }} {{ transaction.transaction.cost_unit }}
        </td>
        <td class="fit">
          <v-btn-group density="compact" variant="text">
            <v-btn
              :to="{ name: 'transaction', params: { id: transaction.id } }"
              prepend-icon="mdi-file-eye"
              >View</v-btn
            >
            <v-btn
              :to="{ name: 'transaction-edit', params: { id: transaction.id } }"
              prepend-icon="mdi-file-edit"
              >Edit</v-btn
            >
          </v-btn-group>
        </td>
      </tr>

      <tr>
        <td colspan="2" class="border-t-lg stretch money-label text-button">Spent</td>
        <td class="fit money border-t-lg text-red-darken-3">{{ sumSpent.toFixed(2) }} EUR</td>
        <td class="border-t-lg"></td>
      </tr>
      <tr>
        <td colspan="2" class="stretch money-label text-button">Earned</td>
        <td class="fit money text-green-darken-3">{{ sumEarned.toFixed(2) }} EUR</td>
        <td></td>
      </tr>
      <tr>
        <td colspan="2" class="stretch money-label text-button">Total</td>
        <td
          :class="{
            ['fit money font-weight-bold']: true,
            ['text-green-darken-3']: sumTotal > 0,
            ['text-red-darken-3']: sumTotal < 0,
          }"
        >
          {{ sumTotal.toFixed(2) }} EUR
        </td>
        <td></td>
      </tr>
    </tbody>
  </v-table>
</template>

<style lang="css" scoped>
tr > td {
  /* max-width: 0; */
  overflow: hidden;
  text-overflow: ellipsis;
}
tr > td.fit {
  min-width: fit-content;
  width: 0;
  white-space: nowrap;
}
tr > td.money,
tr > td.money-label,
tr > td.date {
  text-align: end;
}
</style>
