<script setup lang="ts">
import { computed } from 'vue'

import { useTransactionsStore } from '@/stores/transactions'

const transactionsStore = useTransactionsStore()

const transactions = computed(() =>
  Array.from(transactionsStore.transactions.values()).map((transaction) => ({
    id: transaction.id,
    name: transaction.name,
    transaction,
  })),
)
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
        <td class="fit">
          {{
            transaction.transaction.date
              ? new Date(transaction.transaction.date).toLocaleDateString()
              : '–'
          }}
        </td>
        <td class="stretch">{{ transaction.name ?? '–' }}</td>
        <td class="fit money" v-if="transaction.transaction.cost_type">
          {{ transaction.transaction.cost_type === 'buy' ? '-' : '+'
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
tr > td.money {
  text-align: end;
}
</style>
