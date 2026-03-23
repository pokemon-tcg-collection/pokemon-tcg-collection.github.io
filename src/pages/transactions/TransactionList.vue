<script setup lang="ts">
import { computed } from 'vue'
import type { DataTableHeader, DataTableSortItem } from 'vuetify'

import useTransactionsStats from '@/composables/useTransactionsStats'
import type { Transaction } from '@/model/interfaces'
import { useTransactionsStore } from '@/stores/transactions'
import { formatCurrencyNumber } from '@/utils/locale'
import { sortDates } from '@/utils/sorting'

const transactionsStore = useTransactionsStore()

const { sumSpent, sumEarned, sumTotal } = useTransactionsStats()

interface TransactionItem {
  id: string
  name: string
  transaction: Transaction
}
const transactions = computed(
  () =>
    Array.from(transactionsStore.transactions.values())
      .map((transaction) => ({
        id: transaction.id,
        name: transaction.name,
        transaction,
      }))
      // sort by date descending
      .sort((a, b) => -sortDates(a.transaction.date, b.transaction.date)) as TransactionItem[],
)

const headers: DataTableHeader[] = [
  {
    title: 'Date',
    key: 'transaction.date',
    value: (item) =>
      item.transaction.date ? new Date(item.transaction.date).toLocaleDateString() : '–',
    sortRaw: (a, b) => sortDates(a.transaction.date, b.transaction.date),
    cellProps: ({ item }) => ({
      title: item.transaction.date,
    }),
    minWidth: 'fit-content',
    width: 0,
  },
  {
    title: 'Name',
    key: 'transaction.name',
    value: (item) => item.transaction.name ?? '–',
  },
  {
    title: 'Cost',
    key: 'transaction.cost',
    align: 'end',
    minWidth: 'fit-content',
    width: 0,
    cellProps: {
      style: { whiteSpace: 'nowrap' },
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    minWidth: 'fit-content',
    width: 0,
  },
]
const sortBy: DataTableSortItem[] = [{ key: 'transaction.date', order: 'desc' }]
</script>

<template>
  <h1 class="mb-3">List of Transaction</h1>

  <v-row class="align-center mb-3">
    <v-col>{{ transactions.length }} Transactions</v-col>
    <v-col class="d-flex justify-end">
      <v-btn :to="{ name: 'transaction-new' }" prepend-icon="mdi-pencil-plus">Add new</v-btn>
    </v-col>
  </v-row>

  <v-data-table
    :headers="headers"
    :items="transactions"
    item-key="id"
    :sort-by="sortBy"
    :multi-sort="{ mode: 'append', key: 'ctrl' }"
    :hide-default-footer="transactions.length < 11"
    density="compact"
    striped="even"
  >
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.transaction.cost="{ item }">
      <span
        :class="{
          ['text-green-darken-3']: item.transaction.type === 'sell',
          ['text-red-darken-3']: item.transaction.type === 'buy',
        }"
      >
        {{ item.transaction.type === 'buy' ? '-' : item.transaction.type === 'sell' ? '+' : ''
        }}{{ formatCurrencyNumber(item.transaction.cost) }}
      </span>
      {{ item.transaction.cost_unit }}
    </template>

    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.actions="{ item }">
      <v-btn-group density="compact" variant="text">
        <v-btn :to="{ name: 'transaction', params: { id: item.id } }" prepend-icon="mdi-file-eye"
          >View</v-btn
        >
        <v-btn
          :to="{ name: 'transaction-edit', params: { id: item.id } }"
          prepend-icon="mdi-file-edit"
          >Edit</v-btn
        >
      </v-btn-group>
    </template>

    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #body.append>
      <tr class="v-data-table__tr" key="tr-total-spent">
        <td
          colspan="2"
          class="v-data-table__td v-data-table-column--align-end border-t-lg text-label-large"
        >
          Spent
        </td>
        <td
          class="v-data-table__td v-data-table-column--align-end border-t-lg"
          :style="{ minWidth: 'fit-content', width: 0, whiteSpace: 'nowrap' }"
        >
          <span class="text-red-darken-3">{{ formatCurrencyNumber(sumSpent) }}</span>
          EUR
        </td>
        <td class="v-data-table__td border-t-lg"></td>
      </tr>
      <tr class="v-data-table__tr" key="tr-total-earned">
        <td colspan="2" class="v-data-table__td v-data-table-column--align-end text-label-large">
          Earned
        </td>
        <td
          class="v-data-table__td v-data-table-column--align-end"
          :style="{ minWidth: 'fit-content', width: 0, whiteSpace: 'nowrap' }"
        >
          <span class="text-green-darken-3">{{ formatCurrencyNumber(sumEarned) }}</span>
          EUR
        </td>
        <td class="v-data-table__td"></td>
      </tr>
      <tr class="v-data-table__tr" key="tr-total-sum">
        <td colspan="2" class="v-data-table__td v-data-table-column--align-end text-label-large">
          Total
        </td>
        <td
          class="v-data-table__td v-data-table-column--align-end font-weight-bold"
          :style="{ minWidth: 'fit-content', width: 0, whiteSpace: 'nowrap' }"
        >
          <span
            :class="{
              ['text-green-darken-3']: sumTotal > 0,
              ['text-red-darken-3']: sumTotal < 0,
            }"
            >{{ formatCurrencyNumber(sumTotal) }}</span
          >
          EUR
        </td>
        <td class="v-data-table__td"></td>
      </tr>
    </template>
  </v-data-table>
</template>
