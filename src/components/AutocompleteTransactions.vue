<script setup lang="ts">
import { computed } from 'vue'

import type { RefID, Transaction } from '@/model/interfaces'
import { useTransactionsStore } from '@/stores/transactions'

const model = defineModel<RefID[] | undefined>()

const emit = defineEmits<{
  addNewTransaction: []
}>()

const transactionsStore = useTransactionsStore()

const transaction_ids = computed<{ id: string; label: string; transaction: Transaction }[]>(() =>
  (Array.from(transactionsStore.transactions.values()) as Transaction[]).map((transaction) => ({
    id: transaction.id,
    label: transaction.name,
    transaction,
  })),
)

function onAddNewTransaction() {
  emit('addNewTransaction')
}
</script>

<template>
  <v-autocomplete
    v-model="model"
    :items="transaction_ids"
    item-title="label"
    item-value="id"
    chips
    closable-chips
    clearable
    multiple
    label="Related Transactions"
  >
    <template #no-data>
      <v-list-item>
        <v-list-item-action @click="onAddNewTransaction">Create new Transaction</v-list-item-action>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>
