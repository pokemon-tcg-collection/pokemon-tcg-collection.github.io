<script setup lang="ts">
import type { CardResume, Card as TCGCard } from '@tcgdex/sdk'
import { computed, ref, toRaw, watch } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

import EditorFieldsInternals from '@/components/EditorFieldsInternals.vue'
import EditorFieldsTCGDexCardSelector from '@/components/EditorFieldsTCGDexCardSelector.vue'
import type { Card, Item, Transaction } from '@/model/interfaces'
import { createNewCard } from '@/model/utils'
import { useAuditLogStore } from '@/stores/auditLog'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { useTransactionsStore } from '@/stores/transactions'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const cardsStore = useCardsStore()
const transactionsStore = useTransactionsStore()
const itemsStore = useItemsStore()
const wipStore = useWorkInProgressStore()
const auditLog = useAuditLogStore()

const router = useRouter()
const route = useRoute()

const cardIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.query.returnTo !== undefined ? JSON.parse(route.query.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const existsInStore = cardIdFromParam !== undefined && cardsStore.has(cardIdFromParam)
const card = ref<Card>(
  cardIdFromParam !== undefined && wipStore.has(cardIdFromParam)
    ? wipStore.get<Card>(cardIdFromParam)!
    : existsInStore
      ? cardsStore.get(cardIdFromParam)!
      : createNewCard(),
)

const cards = ref<{ id: string; label: string; card?: CardResume }[]>([])
const boosters = computed<{ id: string; label: string }[]>(() => [])

const item_ids = computed<{ id: string; label: string; item: Item }[]>(() =>
  Array.from(itemsStore.items.values()).map((item) => ({ id: item.id, label: item.name, item })),
)
const transaction_ids = computed<{ id: string; label: string; transaction: Transaction }[]>(() =>
  Array.from(transactionsStore.transactions.values()).map((transaction) => ({
    id: transaction.id,
    label: transaction.name,
    transaction,
  })),
)

watch(card.value, (n, o) => console.debug('Card data changed', { new: toRaw(n), old: toRaw(o) }))

async function onCardSelected(tcg_card: TCGCard) {
  if (!tcg_card) return

  // card.value.language = undefined
  card.value.name = tcg_card.name
  card.value.number = tcg_card.localId
  card.value.set = tcg_card.set.id
  card.value.tcgdex_id = tcg_card.id
}

async function onAddNewItem() {
  // do temp save to allow to return back here
  await wipStore.add(card.value.id, 'card-edit', toRaw(card.value))

  // do a history replace with card-edit and then use the browser history?
  await router.replace({ name: 'card-edit', params: { id: card.value.id }, query: route.query })
  // otherwise, would it work with multiple levels of redirection? --> ToBeTested
  await router.push({
    name: 'item-new',
    query: {
      returnTo: JSON.stringify({
        name: 'card-edit',
        params: { id: card.value.id },
        query: route.query,
      }),
    },
  })
}
async function onAddNewTransaction() {
  // do temp save to allow to return back here
  await wipStore.add(card.value.id, 'card-edit', toRaw(card.value))

  // do a history replace with card-edit and then use the browser history?
  await router.replace({ name: 'card-edit', params: { id: card.value.id }, query: route.query })
  // otherwise, would it work with multiple levels of redirection? --> ToBeTested
  await router.push({
    name: 'transaction-new',
    query: {
      returnTo: JSON.stringify({
        name: 'card-edit',
        params: { id: card.value.id },
        query: route.query,
      }),
    },
  })
}

async function onSave() {
  console.log('Save Card', toRaw(card.value))

  if (existsInStore) card.value._meta.edited = new Date()
  await cardsStore.add(card.value)
  if (wipStore.has(card.value.id)) await wipStore.finish(card.value.id)

  // do a history replace with card-edit and then use the browser history?
  await router.replace({ name: 'card-edit', params: { id: card.value.id }, query: route.query })

  if (returnLocation === undefined) {
    await router.push({ name: 'card', params: { id: card.value.id } })
  } else {
    await router.push(returnLocation)
  }
}
async function onDelete() {
  console.log('Delete Card', toRaw(card.value))

  auditLog.add('Delete card', { card: toRaw(card.value) })
  await cardsStore.remove(card.value)
  if (wipStore.has(card.value.id)) await wipStore.finish(card.value.id)

  if (returnLocation === undefined) {
    await router.push({ name: 'card-list' })
  } else {
    await router.push(returnLocation)
  }
}
</script>

<template>
  <h1 class="mb-3">Card Editor</h1>

  <v-form>
    <fieldset class="pa-3 my-2">
      <legend>Set info</legend>

      <EditorFieldsTCGDexCardSelector
        @card-selected="onCardSelected"
      ></EditorFieldsTCGDexCardSelector>

      <!-- <v-combobox
        v-model="card.boosters"
        :items="boosters"
        multiple
        chips
        closable-chips
        clearable
        label="Boosters with Card"
      ></v-combobox> -->
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Card info</legend>

      <v-combobox
        v-model="card.name"
        :items="cards"
        item-value="label"
        item-title="label"
        label="Card Name"
        clearable
        hide-no-data
        :rules="[(val: string) => !!val && val.trim().length > 0]"
      ></v-combobox>
      <v-text-field v-model="card.number" label="Card Number in Set"></v-text-field>
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Collection info</legend>

      <v-number-input v-model="card.amount" label="Amount of Cards" :min="0"></v-number-input>
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Relations</legend>

      <v-autocomplete
        v-model="card.item_ids"
        :items="item_ids"
        item-title="label"
        item-value="id"
        chips
        closable-chips
        clearable
        multiple
        label="Related Items"
      >
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-action @click="onAddNewItem">Create new Item</v-list-item-action>
          </v-list-item>
        </template>
      </v-autocomplete>
      <v-autocomplete
        v-model="card.transaction_ids"
        :items="transaction_ids"
        item-title="label"
        item-value="id"
        chips
        closable-chips
        clearable
        multiple
        label="Related Transactions"
      >
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-action @click="onAddNewTransaction"
              >Create new Transaction</v-list-item-action
            >
          </v-list-item>
        </template>
      </v-autocomplete>
    </fieldset>

    <EditorFieldsInternals v-model:object="card"></EditorFieldsInternals>

    <div class="d-flex flex-column flex-sm-row ga-3 mt-3">
      <v-btn color="primary" text="Save" @click="onSave"></v-btn>
      <v-btn v-if="existsInStore" color="error" text="Delete" @click="onDelete"></v-btn>
    </div>
  </v-form>
</template>

<style lang="css" scoped>
fieldset > legend {
  padding-inline: 0.3rem;
}
</style>
