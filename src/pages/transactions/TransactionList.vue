<script setup lang="ts">
import { computed } from 'vue'

import useTransactionsStats from '@/composables/useTransactionsStats'
import { useTransactionsStore } from '@/stores/transactions'
import { formatCurrencyNumber } from '@/utils/locale'

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

const { sumSpent, sumEarned, sumTotal } = useTransactionsStats()
</script>

<template>
  <h1 class="mb-3">List of Transaction</h1>

  <v-row class="align-center mb-2">
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
          <span
            :class="{
              ['text-green-darken-3']: transaction.transaction.type === 'sell',
              ['text-red-darken-3']: transaction.transaction.type === 'buy',
            }"
          >
            {{
              transaction.transaction.type === 'buy'
                ? '-'
                : transaction.transaction.type === 'sell'
                  ? '+'
                  : ''
            }}{{ formatCurrencyNumber(transaction.transaction.cost) }}
          </span>
          {{ transaction.transaction.cost_unit }}
        </td>
        <td class="fit money" v-else>
          {{ formatCurrencyNumber(transaction.transaction.cost) }}
          {{ transaction.transaction.cost_unit }}
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
        <td colspan="2" class="border-t-lg stretch money-label text-label-large">Spent</td>
        <td class="fit money border-t-lg">
          <span class="text-red-darken-3">{{ formatCurrencyNumber(sumSpent) }}</span> EUR
        </td>
        <td class="border-t-lg"></td>
      </tr>
      <tr>
        <td colspan="2" class="stretch money-label text-label-large">Earned</td>
        <td class="fit money">
          <span class="text-green-darken-3">{{ formatCurrencyNumber(sumEarned) }}</span> EUR
        </td>
        <td></td>
      </tr>
      <tr>
        <td colspan="2" class="stretch money-label text-label-large">Total</td>
        <td class="fit money font-weight-bold">
          <span
            :class="{
              ['text-green-darken-3']: sumTotal > 0,
              ['text-red-darken-3']: sumTotal < 0,
            }"
            >{{ formatCurrencyNumber(sumTotal) }}</span
          >
          EUR
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
