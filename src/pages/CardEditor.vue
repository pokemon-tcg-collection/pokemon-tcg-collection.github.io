<script setup lang="ts">
import type { Card as TCGCard } from '@tcgdex/sdk'
import { computed, toRaw, watch } from 'vue'
import { useRouter } from 'vue-router'

import AutocompletePokeAPIPokemon from '@/components/AutocompletePokeAPIPokemon.vue'
import EditorBase from '@/components/EditorBase.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import EditorFieldsTCGDexCardSelector from '@/components/EditorFieldsTCGDexCardSelector.vue'
import useEditorObject from '@/composables/useEditorObject'
import type { Item, Transaction } from '@/model/interfaces'
import type { EditRouteNames } from '@/router/routes'
import { useItemsStore } from '@/stores/items'
import { useTransactionsStore } from '@/stores/transactions'

const transactionsStore = useTransactionsStore()
const itemsStore = useItemsStore()

const router = useRouter()

const {
  object: card,
  objectSource: cardSource,
  objectChanged: cardChanged,
  existsInStore,
  returnLocation,
  saveAsDraft: saveCardAsDraft,
  save: saveCard,
  delete: deleteCard,
  discardChanges,
  navigateTo,
} = useEditorObject('card')

// const cards = ref<{ id: string; label: string; card?: CardResume }[]>([])
// const boosters = computed<{ id: string; label: string }[]>(() => [])

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

watch(card, (n, o) => console.debug('Card data changed', { new: toRaw(n), old: toRaw(o) }))

async function onCardSelected(tcg_card: TCGCard) {
  if (!tcg_card) return
  if (!card.value) return

  // card.value.language = undefined
  card.value.name = tcg_card.name
  card.value.number = tcg_card.localId
  card.value.set = tcg_card.set.id
  card.value.tcgdex_id = tcg_card.id
}

async function onAddNewItem() {
  await saveCard()
  await navigateTo('item-new')
}
async function onAddNewTransaction() {
  await saveCardAsDraft()
  await navigateTo('transaction-new')
}
async function onRelationEdit(id: string, type: string) {
  if (!card.value) return

  await saveCardAsDraft()
  await navigateTo(`${type}-edit` as EditRouteNames, { id })
}

async function onSave() {
  if (!card.value) return
  console.log('Save Card', toRaw(card.value))

  await saveCard()

  if (returnLocation.value === undefined) {
    await router.push({ name: 'card', params: { id: card.value.id } })
  } else {
    await router.push(returnLocation.value)
  }
}
async function onDelete() {
  if (!card.value) return
  console.log('Delete Card', toRaw(card.value))

  await deleteCard()

  if (returnLocation.value === undefined) {
    await router.push({ name: 'card-list' })
  } else {
    await router.push(returnLocation.value)
  }
}
async function onLeave(type: 'save' | 'save-draft' | 'discard-changes') {
  if (type === 'save') {
    await saveCard()
  } else if (type === 'save-draft') {
    await saveCardAsDraft()
  } else if (type === 'discard-changes') {
    discardChanges()
  }
}
</script>

<template>
  <EditorBase
    v-model="card"
    object-type="card"
    :object-changed="cardChanged"
    :exists-in-store="existsInStore"
    :is-draft="cardSource === 'wip'"
    title="Card Editor"
    @save="onSave"
    @delete="onDelete"
    @leave-action="onLeave"
    @relation-edit="onRelationEdit"
  >
    <template v-if="card">
      <EditorFieldset label="Set info">
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
      </EditorFieldset>

      <EditorFieldset label="Card info">
        <v-text-field
          v-model="card.name"
          label="Card Name"
          clearable
          hide-no-data
          :rules="[(val: string) => !!val && val.trim().length > 0]"
        ></v-text-field>
        <v-text-field
          v-model="card.number"
          label="Card Number in Set"
          :rules="[(val: string) => !!val && val.trim().length > 0]"
        ></v-text-field>
      </EditorFieldset>

      <EditorFieldset label="API info">
        <AutocompletePokeAPIPokemon v-model="card.pokeapi_pokemon_id"></AutocompletePokeAPIPokemon>
      </EditorFieldset>

      <EditorFieldset label="Collection info">
        <v-number-input v-model="card.amount" label="Amount of Cards" :min="0"></v-number-input>
      </EditorFieldset>

      <EditorFieldset label="Relations">
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
          <template #no-data>
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
          <template #no-data>
            <v-list-item>
              <v-list-item-action @click="onAddNewTransaction"
                >Create new Transaction</v-list-item-action
              >
            </v-list-item>
          </template>
        </v-autocomplete>
      </EditorFieldset>
    </template>
  </EditorBase>
</template>
