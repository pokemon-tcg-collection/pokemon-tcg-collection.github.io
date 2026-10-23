<script setup lang="ts">
import { computed, ref } from 'vue'

import type { RefID, Transaction } from '@/model/interfaces'
import { usePlacesStore } from '@/stores/places'
import { useTransactionsStore } from '@/stores/transactions'

const model = defineModel<RefID[] | undefined>()
const search = ref<string>('')

const emit = defineEmits<{
  addNewTransaction: []
}>()

const transactionsStore = useTransactionsStore()
const placesStore = usePlacesStore()

interface TransactionItem {
  id: string
  label: string
  date_label: string | undefined
  place_label: string | undefined
  transaction: Transaction
}
const transactionItems = computed<TransactionItem[]>(() =>
  (Array.from(transactionsStore.transactions.values()) as Transaction[]).map((transaction) => {
    let placeLabel: string | undefined = undefined
    if (transaction.place_id) {
      const place = placesStore.get(transaction.place_id)
      if (place) {
        placeLabel = place.name
      }
    }

    const dateLabel = transaction.date ? new Date(transaction.date).toLocaleDateString() : '–'

    return {
      id: transaction.id,
      label: transaction.name,
      date_label: dateLabel,
      place_label: placeLabel,
      transaction,
    }
  }),
)

function onAddNewTransaction() {
  emit('addNewTransaction')
}
</script>

<template>
  <v-autocomplete
    v-model="model"
    v-model:search="search"
    :items="transactionItems"
    :filter-keys="['title', 'raw.date_label', 'raw.place_label']"
    item-title="label"
    item-value="id"
    chips
    closable-chips
    clearable
    multiple
    label="Related Transactions"
  >
    <template #item="{ props, item }">
      <v-list-item v-bind="props">
        <template #prepend="{ isSelected }"
          ><v-checkbox-btn
            :key="props.value as string"
            :model-value="isSelected"
            :ripple="false"
            tabindex="-1"
            aria-hidden
            @click="(event: MouseEvent) => event.preventDefault()"
          ></v-checkbox-btn
        ></template>
        <template #title><v-highlight :text="item.label" :query="search" /></template>
        <template #subtitle
          ><v-highlight :text="item.date_label" :query="search" /><template
            v-if="item.place_label !== undefined"
            >{{ ' | ' }}<v-highlight :text="item.place_label" :query="search" /></template
        ></template>
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item @click="onAddNewTransaction">Create new Transaction</v-list-item>
    </template>
  </v-autocomplete>
</template>
