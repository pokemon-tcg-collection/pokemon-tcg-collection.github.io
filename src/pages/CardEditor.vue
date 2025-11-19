<script setup lang="ts">
import type { SupportedLanguages, Card as TCGCard } from '@tcgdex/sdk'
import { computed, ref, toRaw, watch } from 'vue'
import { useRouter } from 'vue-router'

import AutocompletePokeAPIPokemon from '@/components/AutocompletePokeAPIPokemon.vue'
import EditorBase from '@/components/EditorBase.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import EditorTCGdexCardSelectorDialog from '@/components/EditorTCGdexCardSelectorDialog.vue'
import useEditorObject from '@/composables/useEditorObject'
import type { Item, Transaction } from '@/model/interfaces'
import { CARD_LANGUAGES } from '@/model/interfaces'
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
  setAsTemplate: setCardAsTemplate,
  saveAsDraft: saveCardAsDraft,
  save: saveCard,
  delete: deleteCard,
  discardChanges,
  navigateTo,
  reload: reloadCard,
} = useEditorObject('card')

const showTCGdexDialog = ref<boolean>(false)

// const cards = ref<{ id: string; label: string; card?: CardResume }[]>([])
// const boosters = computed<{ id: string; label: string }[]>(() => [])

const item_ids = computed<{ id: string; label: string; item: Item }[]>(() =>
  Array.from(itemsStore.items.values()).map((item) => ({ id: item.id, label: item.name, item })),
)
const transaction_ids = computed<{ id: string; label: string; transaction: Transaction }[]>(() =>
  (Array.from(transactionsStore.transactions.values()) as Transaction[]).map((transaction) => ({
    id: transaction.id,
    label: transaction.name,
    transaction,
  })),
)

watch(card, (n, o) => console.debug('Card data changed', { new: toRaw(n), old: toRaw(o) }))

async function onCardSelected(tcg_card: TCGCard, language: SupportedLanguages, overwrite: boolean) {
  if (!tcg_card) return
  if (!card.value) return

  console.debug('[onCardSelected]', {
    card: toRaw(card.value),
    tcg_card: toRaw(tcg_card),
    overwrite,
  })

  if (overwrite || !card.value.language) card.value.language = language
  if (overwrite || !card.value.name) card.value.name = tcg_card.name
  if (overwrite || !card.value.number) card.value.number = tcg_card.localId

  // TODO: we might want to use our own set information?
  // if (overwrite || !card.value.set) card.value.set = tcg_card.set.id

  if (overwrite || !card.value.tcgdex_id) card.value.tcgdex_id = tcg_card.id

  if (tcg_card.dexId !== undefined && tcg_card.dexId.length > 0) {
    if (
      overwrite ||
      card.value.pokeapi_pokemon_id === undefined ||
      card.value.pokeapi_pokemon_id === null
    ) {
      card.value.pokeapi_pokemon_id = tcg_card.dexId[0]
      if (tcg_card.dexId.length > 1) {
        console.warn('Found multiple dexIds for TCGdex card, default to first', {
          dexId: tcg_card.dexId[0],
          tcg_card: toRaw(tcg_card),
        })
      }
    }
  }
}

async function onAddNewItem() {
  await saveCard()
  await navigateTo('item-new')
}
async function onAddNewTransaction() {
  await saveCardAsDraft()
  await navigateTo('transaction-new')
}

async function onSave() {
  if (!card.value) return

  if (returnLocation.value === undefined) {
    await router.push({ name: 'card', params: { id: card.value.id } })
  } else {
    await router.push(returnLocation.value)
  }
}
async function onDelete() {
  if (!card.value) return

  if (returnLocation.value === undefined) {
    await router.push({ name: 'card-list' })
  } else {
    await router.push(returnLocation.value)
  }
}
</script>

<template>
  <EditorBase
    v-model="card"
    object-type="card"
    :object-changed="cardChanged"
    :exists-in-store="existsInStore"
    :object-source="cardSource"
    title="Card Editor"
    :save="saveCard"
    :save-as-draft="saveCardAsDraft"
    :set-as-template="setCardAsTemplate"
    :delete="deleteCard"
    :discard-changes="discardChanges"
    :navigate-to="navigateTo"
    :reload="reloadCard"
    @save="onSave"
    @delete="onDelete"
  >
    <template v-if="card">
      <EditorFieldset label="Autofill helpers">
        <v-btn text="Use TCGdex to select Card data" @click="showTCGdexDialog = true">
          <template #prepend>
            <v-avatar image="/service-logos/tcgdex_logo.svg" size="x-small" rounded="0"></v-avatar>
          </template>
        </v-btn>
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

      <EditorFieldset label="Set info">
        <v-autocomplete
          v-model="card.language"
          :items="CARD_LANGUAGES"
          item-value="code"
          item-title="name"
          label="Card Language"
        ></v-autocomplete>

        <v-text-field v-model="card.set" label="Card Set"></v-text-field>

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

      <EditorFieldset label="API info">
        <AutocompletePokeAPIPokemon v-model="card.pokeapi_pokemon_id">
          <template #prepend>
            <v-avatar image="/service-logos/pokeapi_logo.png" rounded="0"></v-avatar>
          </template>
        </AutocompletePokeAPIPokemon>

        <v-divider></v-divider>

        <p class="ms-14 mt-2 mb-4">
          <span class="text-grey-darken-1 me-2">
            Manually changing the TCGdex information is not recommended. Use the input dialog to
            ensure consistency.
          </span>
          <v-btn text="Use TCGdex to select Card data" @click="showTCGdexDialog = true">
            <template #prepend>
              <v-avatar
                image="/service-logos/tcgdex_logo.svg"
                size="x-small"
                rounded="0"
              ></v-avatar>
            </template>
          </v-btn>
        </p>

        <v-text-field v-model="card.tcgdex_id" label="TCGdex Card ID">
          <template #prepend>
            <v-avatar image="/service-logos/tcgdex_logo.svg" rounded="0"></v-avatar>
          </template>
        </v-text-field>
      </EditorFieldset>

      <EditorFieldset label="Collection info">
        <v-number-input v-model="card.amount" label="Amount of Cards" :min="0"></v-number-input>

        <!-- TODO: detailed card information -->
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

      <EditorTCGdexCardSelectorDialog
        v-model="showTCGdexDialog"
        @card-selected="onCardSelected"
      ></EditorTCGdexCardSelectorDialog>
    </template>
  </EditorBase>
</template>
