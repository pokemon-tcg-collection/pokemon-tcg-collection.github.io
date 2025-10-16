<script setup lang="ts">
import type { CardResume, Set, SetResume, SupportedLanguages, Card as TCGCard } from '@tcgdex/sdk'
import TCGdex, { CardResumeModel, Query, SetResumeModel } from '@tcgdex/sdk'
import { computed, readonly, ref, toRaw, watch } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

import type { Card, Item, Transaction } from '@/model/interfaces'
import { CARD_LANGUAGES, TCGDEX_LANGUAGES } from '@/model/interfaces'
import { createNewCard } from '@/model/utils'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { useSettingsStore } from '@/stores/settings'
import { useTransactionsStore } from '@/stores/transactions'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const wipStore = useWorkInProgressStore()
const cardsStore = useCardsStore()
const transactionsStore = useTransactionsStore()
const itemsStore = useItemsStore()
const settings = useSettingsStore()

const router = useRouter()
const route = useRoute()

const cardIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.query.returnTo !== undefined ? JSON.parse(route.query.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const card = ref<Card>(
  cardIdFromParam !== undefined && wipStore.has(cardIdFromParam)
    ? wipStore.get<Card>(cardIdFromParam)!
    : cardIdFromParam !== undefined && cardsStore.has(cardIdFromParam)
      ? cardsStore.get(cardIdFromParam)!
      : createNewCard(),
)

const tcgdex = computed(() => {
  const language = TCGDEX_LANGUAGES.includes(card.value.language) ? card.value.language : 'en'
  const tcgdex = new TCGdex(language as SupportedLanguages)
  console.log('Creating new TCGDex API adapter', tcgdex)
  Object.assign(window, { tcgdex })
  return tcgdex
})

const setInfoByUser = ref(false)

const languages = readonly(CARD_LANGUAGES)
const sets = ref<{ id: string; label: string; set?: SetResume }[]>([])
const cards = ref<{ id: string; label: string; card?: CardResume }[]>([])
const boosters = computed<{ id: string; label: string }[]>(() => [])

const isLoadingSets = ref(false)
const isLoadingCards = ref(false)

const item_ids = computed<{ id: string; label: string; item: Item }[]>(() =>
  Array.from(itemsStore.items.values()).map((item) => ({ id: item.id, label: item.label, item })),
)
const transaction_ids = computed<{ id: string; label: string; transaction: Transaction }[]>(() =>
  Array.from(transactionsStore.transactions.values()).map((transaction) => ({
    id: transaction.id,
    label: transaction.name ?? 'TODO: generate label',
    transaction,
  })),
)

watch(card.value, (n, o) => console.debug('Card data changed', { new: toRaw(n), old: toRaw(o) }))

async function updateTCGData() {
  if (!tcgdex.value) {
    console.warn('API not ready!')
    return
  }

  console.debug('Updating TCG data ...')

  isLoadingSets.value = true

  const tcgSets = await tcgdex.value.set.list()
  sets.value = tcgSets.map((set) => ({ id: set.id, label: set.name, set: set }))

  isLoadingSets.value = false
}
async function updateTCGCardData() {
  if (!tcgdex.value) {
    console.warn('API not ready!')
    return
  }

  const newSetId = card.value.set
  if (!newSetId) {
    cards.value = []
    return
  }

  console.debug('Updating TCG card data ...')

  isLoadingCards.value = true

  await onSetSelected(newSetId)

  const tcgCards = await tcgdex.value.card.list(Query.create().equal('set', newSetId))
  cards.value = tcgCards.map((setCard) => ({ id: setCard.id, label: setCard.name, card: setCard }))

  isLoadingCards.value = false
}

async function onSetSelected(setId: string) {
  if (!tcgdex.value) {
    console.warn('API not ready!')
    return
  }

  let tcgSet: Set | null | undefined = undefined

  if (sets.value.length > 0) {
    const tcgSetInfo = sets.value.find((set) => set.id === setId)?.set
    if (tcgSetInfo !== undefined && tcgSetInfo instanceof SetResumeModel) {
      tcgSet = await tcgSetInfo.getSet()
    }
  }
  if (tcgSet === undefined) {
    tcgSet = await tcgdex.value.set.get(setId)
  }
  console.debug('Set', tcgSet)
  if (tcgSet === undefined || tcgSet === null) return
}
async function onCardSelected(cardId: string) {
  if (!tcgdex.value) {
    console.warn('API not ready!')
    return
  }

  let tcgCard: TCGCard | null | undefined = undefined

  if (cards.value.length > 0) {
    const tcgCardInfo = cards.value.find((card) => card.id === cardId)?.card
    if (tcgCardInfo !== undefined && tcgCardInfo instanceof CardResumeModel) {
      tcgCard = await tcgCardInfo.getCard()
    }
  }
  if (tcgCard === undefined) {
    tcgCard = await tcgdex.value.card.get(cardId)
  }
  console.debug('Card', tcgCard)
  if (tcgCard === undefined || tcgCard === null) return

  card.value.number = tcgCard.localId
  card.value.name = tcgCard.name
  card.value.tcgdex_id = tcgCard.id
}

async function onAddNewItem() {
  // do temp save to allow to return back here
  wipStore.add(card.value.id, 'card-edit', toRaw(card.value))

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
  wipStore.add(card.value.id, 'card-edit', toRaw(card.value))

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

  cardsStore.add(card.value)
  if (wipStore.has(card.value.id)) wipStore.finish(card.value.id)

  // do a history replace with card-edit and then use the browser history?
  await router.replace({ name: 'card-edit', params: { id: card.value.id }, query: route.query })

  if (returnLocation === undefined) {
    await router.push({ name: 'card', params: { id: card.value.id } })
  } else {
    await router.push(returnLocation)
  }
}

// on load and on language change, update set list
watch(
  tcgdex,
  (n, o) => {
    if (n === o || !n) return
    updateTCGData()
    // if card already has a set selected
    updateTCGCardData()
  },
  { immediate: true },
)
// on set change, update card list
watch(
  () => card.value.set,
  (n, o) => {
    if (n === o) return
    updateTCGCardData()
  },
)
</script>

<template>
  <h1 class="mb-3">Card Editor</h1>

  <v-form>
    <fieldset class="pa-3 my-2">
      <legend>Set info</legend>
      <v-checkbox v-model="setInfoByUser" label="Manual input"></v-checkbox>
      <v-autocomplete
        v-model="card.language"
        :items="languages"
        item-value="code"
        item-title="name"
        label="Language"
      ></v-autocomplete>
      <v-autocomplete
        v-model="card.set"
        @update:model-value="onSetSelected"
        :items="sets"
        item-value="id"
        item-title="label"
        :loading="isLoadingSets"
        label="Name of Set"
        clearable
        hide-no-data
      ></v-autocomplete>
      <v-autocomplete
        v-model="card.tcgdex_id"
        @update:model-value="onCardSelected"
        :items="cards"
        item-value="id"
        item-title="label"
        :loading="isLoadingCards"
        label="Card"
        clearable
        hide-no-data
      ></v-autocomplete>

      <v-combobox
        v-model="card.boosters"
        :items="boosters"
        multiple
        chips
        closable-chips
        clearable
        label="Boosters with Card"
      ></v-combobox>
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

    <fieldset class="pa-3 my-2" v-if="settings.editorShowInternalID">
      <legend>Internals</legend>
      <v-text-field
        v-if="settings.editorShowInternalID"
        v-model="card.id"
        readonly
        label="Internal Card ID"
      ></v-text-field>
    </fieldset>

    <v-btn color="primary" text="Save" @click="onSave"></v-btn>
  </v-form>
</template>

<style lang="css" scoped>
fieldset > legend {
  padding-inline: 0.3rem;
}
</style>
