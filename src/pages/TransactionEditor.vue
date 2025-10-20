<script setup lang="ts">
import { computed, readonly, ref, toRaw } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

import EditorFieldsInternals from '@/components/EditorFieldsInternals.vue'
import type { Item, Place, Transaction } from '@/model/interfaces'
import { COST_UNITS, TRANSACTION_TYPE } from '@/model/interfaces'
import { createNewTransaction } from '@/model/utils'
import { useAuditLogStore } from '@/stores/auditLog'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useTransactionsStore } from '@/stores/transactions'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const { smAndDown, xs } = useDisplay()

const transactionsStore = useTransactionsStore()
const placesStore = usePlacesStore()
const itemsStore = useItemsStore()
const wipStore = useWorkInProgressStore()
const auditLog = useAuditLogStore()

const router = useRouter()
const route = useRoute()

const transactionIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.query.returnTo !== undefined ? JSON.parse(route.query.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const existsInStore =
  transactionIdFromParam !== undefined && transactionsStore.has(transactionIdFromParam)
const transaction = ref<Transaction>(
  transactionIdFromParam !== undefined && wipStore.has(transactionIdFromParam)
    ? wipStore.get<Transaction>(transactionIdFromParam)!
    : existsInStore
      ? transactionsStore.get(transactionIdFromParam)!
      : createNewTransaction(),
)

const transactionDate = computed({
  get: () => (transaction.value.date ? new Date(transaction.value.date) : new Date()),
  set: (v: Date) => {
    if (transaction.value.date) {
      // if an valid previous date exists, update time since date picker will zero it
      const oldDate = new Date(transaction.value.date)
      v.setHours(oldDate.getHours())
      v.setMinutes(oldDate.getMinutes())
      v.setSeconds(oldDate.getSeconds())
    }
    console.log('[transactionDate:set]', v)
    transaction.value.date = v
  },
})
const transactionDateDisplay = computed(() => transactionDate.value.toLocaleDateString())
const transactionTime = computed({
  get: () => (transaction.value.date ? new Date(transaction.value.date) : new Date()),
  set: (v: string) => {
    const parts = v.split(':')
    if (parts.length < 2 || parts.length > 3) return
    const newDate = transaction.value.date ? new Date(transaction.value.date) : new Date()
    newDate.setHours(Number.parseInt(parts[0]!))
    newDate.setMinutes(Number.parseInt(parts[1]!))
    newDate.setSeconds(parts[2] ? Number.parseInt(parts[2]) : 0)
    console.log('[transactionTime:set]', newDate)
    transaction.value.date = newDate
  },
})
const transactionTimeDisplay = computed(() => transactionTime.value.toLocaleTimeString())

const costUnits = readonly(COST_UNITS)
const transactionTypes = readonly(TRANSACTION_TYPE)

const item_ids = computed<{ id: string; label: string; item: Item }[]>(() =>
  Array.from(itemsStore.items.values()).map((item) => ({ id: item.id, label: item.name, item })),
)
const place_ids = computed<{ id: string; label: string; place: Place }[]>(() =>
  Array.from(placesStore.places.values()).map((place) => ({
    id: place.id,
    label: place.name,
    place,
  })),
)

const newItemId = ref<string>()

async function onAddNewLocation() {
  // do temp save to allow to return back here
  await wipStore.add(transaction.value.id, 'transaction-edit', toRaw(transaction.value))

  // do a history replace with transaction-edit to allow returning to this transaction editor
  await router.replace({
    name: 'transaction-edit',
    params: { id: transaction.value.id },
    query: route.query,
  })
  await router.push({
    name: 'place-new',
    query: {
      returnTo: JSON.stringify({
        name: 'transaction-edit',
        params: { id: transaction.value.id },
        query: route.query,
      }),
    },
  })
}
async function onAddNewItem() {
  // do temp save to allow to return back here
  await wipStore.add(transaction.value.id, 'transaction-edit', toRaw(transaction.value))

  // do a history replace with transaction-edit to allow returning to this transaction editor
  await router.replace({
    name: 'transaction-edit',
    params: { id: transaction.value.id },
    query: route.query,
  })
  await router.push({
    name: 'item-new',
    query: {
      returnTo: JSON.stringify({
        name: 'transaction-edit',
        params: { id: transaction.value.id },
        query: route.query,
      }),
    },
  })
}

function onRemoveItem(item_idx: number) {
  transaction.value.items = transaction.value.items?.filter((_val, idx) => idx !== item_idx) ?? []
}
function onAddItemToTransaction() {
  if (!newItemId.value) return

  // TODO: prefill MSRP price if it exists?

  transaction.value.items.push({
    amount: 1,
    item_id: newItemId.value,
    cost: 0,
    cost_unit: 'EUR',
  })
}

async function onSave() {
  console.log('Save Transaction', toRaw(transaction.value))

  if (existsInStore) transaction.value._meta.edited = new Date()
  await transactionsStore.add(transaction.value)
  if (wipStore.has(transaction.value.id)) await wipStore.finish(transaction.value.id)

  // do a history replace with transaction-edit and then use the browser history?
  await router.replace({
    name: 'transaction-edit',
    params: { id: transaction.value.id },
    query: route.query,
  })

  if (returnLocation === undefined) {
    await router.push({ name: 'transaction', params: { id: transaction.value.id } })
  } else {
    await router.push(returnLocation)
  }
}
async function onDelete() {
  console.log('Delete Transaction', toRaw(transaction.value))

  auditLog.add('Delete transaction', { transaction: toRaw(transaction.value) })
  await transactionsStore.remove(transaction.value)
  if (wipStore.has(transaction.value.id)) await wipStore.finish(transaction.value.id)

  if (returnLocation === undefined) {
    await router.push({ name: 'transaction-list' })
  } else {
    await router.push(returnLocation)
  }
}
</script>

<template>
  <h1 class="mb-3">Transaction Editor</h1>

  <v-form>
    <fieldset class="pa-3 my-2">
      <legend>Description</legend>

      <v-text-field
        v-model="transaction.name"
        label="Short name"
        :rules="[(val: string) => !!val && val.trim().length > 0]"
        clearable
      ></v-text-field>
      <v-textarea v-model="transaction.description" label="Description"></v-textarea>

      <v-text-field
        v-model="transaction.url"
        label="URL (product or information webpage)"
        clearable
      ></v-text-field>
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Transaction Details</legend>

      <v-row justify="space-around">
        <v-col col="12" md="6">
          <v-select
            v-model="transaction.type"
            :items="transactionTypes"
            item-value="id"
            item-title="label"
            label="Type of Transaction"
            clearable
          ></v-select>
          <v-row>
            <!-- TODO: breakpoints with nesting are weird -->
            <v-col sm="6" cols="12" :class="smAndDown && 'pb-0'">
              <!-- decimal-separator="," -->
              <v-number-input
                v-model="transaction.cost"
                :control-variant="xs ? 'hidden' : 'default'"
                :precision="2"
                :min="0.0"
                label="Cost"
              ></v-number-input>
            </v-col>
            <v-col sm="6" cols="12" :class="{ ['pb-0']: smAndDown, ['pt-0']: xs }">
              <v-select
                v-model="transaction.cost_unit"
                :items="costUnits"
                item-value="id"
                item-title="title"
                label="Currency"
              ></v-select>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="6">
          <v-row>
            <v-col cols="12" sm="6" :class="smAndDown && 'py-0'">
              <v-text-field
                :model-value="transactionDateDisplay"
                label="Date"
                prepend-icon="mdi-calendar-outline"
                readonly
              >
                <v-menu :close-on-content-click="false" activator="parent" min-width="0">
                  <v-date-picker
                    v-model="transactionDate"
                    :max="new Date()"
                    show-adjacent-months
                  ></v-date-picker>
                </v-menu>
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6" :class="smAndDown && 'py-0'">
              <v-text-field
                :model-value="transactionTimeDisplay"
                label="Time"
                prepend-icon="mdi-clock-time-four-outline"
                readonly
              >
                <v-menu :close-on-content-click="false" activator="parent" min-width="0">
                  <v-time-picker
                    v-model="transactionTime"
                    format="24hr"
                    view-mode="second"
                    :use-seconds="true"
                  ></v-time-picker>
                </v-menu>
              </v-text-field>
            </v-col>
          </v-row>
          <v-autocomplete
            v-model="transaction.place_id"
            :items="place_ids"
            item-title="label"
            item-value="id"
            clearable
            label="Location"
            prepend-icon="mdi-store-marker"
          >
            <template v-slot:no-data>
              <v-list-item>
                <v-list-item-action @click="onAddNewLocation"
                  >Create a new Location</v-list-item-action
                >
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </fieldset>

    <fieldset class="pa-3 my-2 pt-5">
      <legend>Items</legend>

      <v-row class="gc-5 ms-0 me-0" v-for="(item, i) in transaction.items" :key="i">
        <v-number-input
          v-model="item.amount"
          :min="1"
          :control-variant="xs ? 'hidden' : 'default'"
          label="Amount"
          min-width="5rem"
          width="max-content"
        ></v-number-input>

        <!-- decimal-separator="," -->
        <v-number-input
          v-model="item.cost"
          :control-variant="xs ? 'hidden' : 'default'"
          :precision="2"
          :min="0.0"
          min-width="5rem"
          label="Cost"
        ></v-number-input>
        <v-select
          v-model="item.cost_unit"
          :items="costUnits"
          item-value="id"
          item-title="title"
          min-width="5rem"
          label="Currency"
        ></v-select>

        <v-autocomplete
          v-model="item.item_id"
          :items="item_ids"
          item-title="label"
          item-value="id"
          readonly
          label="Item"
        >
          <template v-slot:append>
            <v-btn flat icon="mdi-delete" @click="() => onRemoveItem(i)"></v-btn>
          </template>
        </v-autocomplete>
      </v-row>

      <v-divider class="mt-2 mb-4" v-if="transaction.items.length > 0"></v-divider>

      <v-autocomplete
        v-model="newItemId"
        :items="item_ids"
        item-title="label"
        item-value="id"
        clearable
        label="Items"
      >
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-action @click="onAddNewItem">Create new Item</v-list-item-action>
          </v-list-item>
        </template>
        <template v-slot:append>
          <v-btn @click="onAddItemToTransaction">Add item</v-btn>
        </template>
      </v-autocomplete>
    </fieldset>

    <!-- TODO: attachments -->

    <EditorFieldsInternals v-model:object="transaction"></EditorFieldsInternals>

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
