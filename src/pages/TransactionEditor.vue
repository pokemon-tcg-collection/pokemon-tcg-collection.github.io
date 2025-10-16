<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { computed, ref, toRaw } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

import type { Place, Transaction } from '@/model/interfaces'
import { usePlacesStore } from '@/stores/places'
import { useTransactionsStore } from '@/stores/transactions'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const { smAndDown, xs } = useDisplay()

const transactionsStore = useTransactionsStore()
const placesStore = usePlacesStore()
const wipStore = useWorkInProgressStore()

const router = useRouter()
const route = useRoute()

const transactionIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.query.returnTo !== undefined ? JSON.parse(route.query.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const transaction = ref<Transaction>(
  transactionIdFromParam !== undefined && wipStore.has(transactionIdFromParam)
    ? wipStore.get<Transaction>(transactionIdFromParam)!
    : transactionIdFromParam !== undefined && transactionsStore.has(transactionIdFromParam)
      ? transactionsStore.get(transactionIdFromParam)!
      : {
          id: uuidv4(),
          type: 'purchase',
          cost: 0,
          cost_unit: 'EUR',
          date: new Date(),
        },
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
    transaction.value.date = newDate
  },
})
const transactionTimeDisplay = computed(() => transactionTime.value.toLocaleTimeString())

const place_ids = computed<{ id: string; label: string; place: Place }[]>(() =>
  Array.from(placesStore.places.values()).map((place) => ({
    id: place.id,
    label: place.name,
    place,
  })),
)

async function onAddNewLocation() {
  console.debug('[onAddNewLocation]')

  // do temp save to allow to return back here
  wipStore.add(transaction.value.id, 'transaction-edit', toRaw(transaction.value))

  // do a history replace with transaction-edit to allow returning to this transaction editor
  await router.replace({
    name: 'transaction-edit',
    params: { id: transaction.value.id },
    query: route.query,
  })
  await router.push({
    name: 'place-new',
    query: {
      returnTo: JSON.stringify({ name: 'transaction-edit', params: { id: transaction.value.id } }),
    },
  })
}
async function onSave() {
  console.log('Save Transaction', toRaw(transaction.value))

  transactionsStore.add(transaction.value)
  if (wipStore.has(transaction.value.id)) wipStore.finish(transaction.value.id)

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
</script>

<template>
  <h1 class="mb-3">Transaction Editor</h1>

  <v-form>
    <fieldset class="pa-3 my-2">
      <legend>Description</legend>

      <v-text-field v-model="transaction.name" label="Short name" clearable></v-text-field>
      <v-textarea v-model="transaction.description" label="Description"></v-textarea>
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Transaction Details</legend>

      <v-row justify="space-around">
        <v-col col="12" md="6">
          <v-select
            v-model="transaction.cost_type"
            :items="[
              { title: 'Buy', value: 'buy' },
              { title: 'Sell', value: 'sell' },
            ]"
            label="Type of Transaction"
            clearable
          ></v-select>
          <v-row>
            <!-- TODO: breakpoints with nesting are weird -->
            <v-col sm="6" cols="12" :class="smAndDown && 'pb-0'">
              <!-- decimal-separator="," -->
              <v-number-input
                v-model="transaction.cost"
                :precision="2"
                :min="0.0"
                label="Cost"
              ></v-number-input>
            </v-col>
            <v-col sm="6" cols="12" :class="{ ['pb-0']: smAndDown, ['pt-0']: xs }">
              <v-select
                v-model="transaction.cost_unit"
                :items="[{ title: 'Euro (€)', value: 'EUR' }]"
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
                  >Add a new Location</v-list-item-action
                >
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Items</legend>
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Internals</legend>
      <v-text-field
        v-model="transaction.id"
        readonly
        label="Internal Transaction ID"
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
