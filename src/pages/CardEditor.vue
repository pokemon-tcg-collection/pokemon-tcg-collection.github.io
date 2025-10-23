<script setup lang="ts">
import type { Card as TCGCard } from '@tcgdex/sdk'
import { until } from '@vueuse/core'
import { computed, onMounted, ref, toRaw, watch } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

import EditorConfirmChangesDialog from '@/components/EditorConfirmChangesDialog.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import EditorFieldsInternals from '@/components/EditorFieldsInternals.vue'
import EditorFieldsRelated from '@/components/EditorFieldsRelated.vue'
import EditorFieldsTCGDexCardSelector from '@/components/EditorFieldsTCGDexCardSelector.vue'
import type { Card, Item, Transaction } from '@/model/interfaces'
import { createNewCard, isCardChanged } from '@/model/utils'
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

const existsAsDraft = computed(() => cardIdFromParam !== undefined && wipStore.has(cardIdFromParam))
const existsInStore = computed(
  () => cardIdFromParam !== undefined && cardsStore.has(cardIdFromParam),
)
const cardSource = ref<'card-store' | 'wip-store' | 'new'>()
const cardBase = ref<Card>()
const card = ref<Card>()
const cardChanged = computed(() => isCardChanged(cardBase.value, card.value))

onMounted(async () => {
  let cardGot: Card | undefined = undefined
  if (cardIdFromParam !== undefined) {
    await until(() => wipStore.$isHydrated && cardsStore.$isHydrated).toBeTruthy()

    if (existsAsDraft.value) {
      cardGot = wipStore.get<Card>(cardIdFromParam)!
      cardSource.value = 'wip-store'
    } else if (existsInStore.value) {
      cardGot = cardsStore.get(cardIdFromParam)!
      cardSource.value = 'card-store'
    }
  } else {
    cardGot = createNewCard()
    cardSource.value = 'new'
  }
  if (cardGot !== undefined) {
    cardBase.value = structuredClone(cardGot)
    card.value = cardGot
  }
})

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

async function _safe(replaceHistory: boolean = true) {
  if (!card.value) return

  // update metadata and add/update in store
  if (existsInStore.value) card.value._meta.edited = new Date()
  await cardsStore.add(card.value)

  // finish draft
  if (wipStore.has(card.value.id)) await wipStore.finish(card.value.id)

  // update base version, so no edit changes should be found
  cardBase.value = structuredClone(toRaw(card.value))
  cardSource.value = 'card-store'

  if (replaceHistory && route.name !== 'card-edit') {
    // do a history replace with card-edit and then use the browser history?
    await router.replace({ name: 'card-edit', params: { id: card.value.id }, query: route.query })
  }
}
async function _safeWIP(replaceHistory: boolean = true) {
  if (!card.value) return

  // do temp save to allow to return back here
  await wipStore.add(card.value.id, 'card-edit', toRaw(card.value))

  // update base version, so no edit changes should be found
  cardBase.value = structuredClone(toRaw(card.value))
  cardSource.value = 'wip-store'

  if (replaceHistory) {
    // do a history replace with card-edit and then use the browser history?
    await router.replace({ name: 'card-edit', params: { id: card.value.id }, query: route.query })
  }
}
async function _navigateTo(name: 'transaction-new' | 'item-new') {
  if (!card.value) return

  await router.push({
    name: name,
    query: {
      returnTo: JSON.stringify({
        name: 'card-edit',
        params: { id: card.value.id },
        query: route.query,
      }),
    },
  })
}

async function onAddNewItem() {
  await _safeWIP()
  await _navigateTo('item-new')
}
async function onAddNewTransaction() {
  await _safeWIP()
  await _navigateTo('transaction-new')
}
async function onRelationEdit(id: string, type: string) {
  if (!card.value) return

  await _safeWIP()

  router.push({
    name: `${type}-edit`,
    params: { id: id },
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
  if (!card.value) return
  console.log('Save Card', toRaw(card.value))

  await _safe()

  if (returnLocation === undefined) {
    await router.push({ name: 'card', params: { id: card.value.id } })
  } else {
    await router.push(returnLocation)
  }
}
async function onDelete() {
  if (!card.value) return
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

async function onUserChoiceSave() {
  await _safe()
}
async function onUserChoiceSaveDraft() {
  await _safeWIP()
}
async function onUserChoiceDiscardChanges() {
  // reset editable object
  card.value = structuredClone(toRaw(cardBase.value))
}

const dialogToAskUserAboutChanges = ref<boolean>(false)
onBeforeRouteLeave(async (to, from) => {
  if (!card.value) return true

  // console.debug('onBeforeRouteLeave', `${String(from.name)} --> ${String(to.name)}`)
  if (from.name === 'card-new' && to.name === 'card-edit' && to.params.id === card.value.id) {
    return true
  }

  if (cardChanged.value) {
    dialogToAskUserAboutChanges.value = true
    return false
  }
})
</script>

<template>
  <h1 class="mb-3">Card Editor<template v-if="cardChanged"> [changed]</template></h1>

  <v-form v-if="card">
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
    </EditorFieldset>

    <EditorFieldsRelated
      :object="card"
      object-type="card"
      @edit="onRelationEdit"
    ></EditorFieldsRelated>

    <EditorFieldsInternals v-model:object="card"></EditorFieldsInternals>

    <div class="d-flex flex-column flex-sm-row ga-3 mt-3">
      <v-btn color="primary" text="Save" @click="onSave"></v-btn>
      <v-btn v-if="existsInStore" color="error" text="Delete" @click="onDelete"></v-btn>
    </div>
  </v-form>

  <EditorConfirmChangesDialog
    v-model="dialogToAskUserAboutChanges"
    :is-draft="cardSource === 'wip-store'"
    @save="onUserChoiceSave"
    @save-draft="onUserChoiceSaveDraft"
    @discard="onUserChoiceDiscardChanges"
  ></EditorConfirmChangesDialog>
</template>
