<script setup lang="ts">
import { computed, readonly, ref } from 'vue'
import { useDisplay } from 'vuetify'

import AutocompleteItem from '@/components/AutocompleteItem.vue'
import AutocompletePlace from '@/components/AutocompletePlace.vue'
import EditorBase from '@/components/EditorBase.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import useEditorObject from '@/composables/useEditorObject'
import { COST_UNITS, TRANSACTION_TYPE } from '@/model/interfaces'

const { smAndDown, xs } = useDisplay()

const {
  object: transaction,
  objectSource: transactionSource,
  objectChanged: transactionChanged,
  existsInStore,
  returnLocation,
  setAsTemplate: setTransactionAsTemplate,
  saveAsDraft: saveTransactionAsDraft,
  save: saveTransaction,
  delete: deleteTransaction,
  discardChanges,
  navigateTo,
  reload: reloadTransaction,
} = useEditorObject('transaction')

const transactionDate = computed({
  get: () => (transaction.value?.date ? new Date(transaction.value.date) : new Date()),
  set: (v: Date) => {
    if (!transaction.value) return

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
  get: () => (transaction.value?.date ? new Date(transaction.value.date) : new Date()),
  set: (v: string) => {
    if (!transaction.value) return

    const parts = v.split(':')
    if (parts.length < 2 || parts.length > 3) return
    const newDate = transaction.value.date ? new Date(transaction.value.date) : new Date()
    newDate.setHours(Number.parseInt(parts[0]!))
    newDate.setMinutes(Number.parseInt(parts[1]!))
    newDate.setSeconds(parts[2] ? Number.parseInt(parts[2]) : 0)
    console.debug('[transactionTime:set]', newDate)
    transaction.value.date = newDate
  },
})
const transactionTimeDisplay = computed(() => transactionTime.value.toLocaleTimeString())

const costUnits = readonly(COST_UNITS)
const transactionTypes = readonly(TRANSACTION_TYPE)

const newItemId = ref<string>()

async function onAddNewLocation() {
  await saveTransactionAsDraft()
  await navigateTo('place-new')
}
async function onAddNewItem() {
  await saveTransactionAsDraft()
  await navigateTo('item-new')
}

function onRemoveItem(item_idx: number) {
  if (!transaction.value) return
  transaction.value.items = transaction.value.items?.filter((_val, idx) => idx !== item_idx) ?? []
}
function onAddItemToTransaction() {
  if (!transaction.value) return
  if (!newItemId.value) return

  // TODO: prefill MSRP price if it exists?

  transaction.value.items.push({
    amount: 1,
    item_id: newItemId.value,
    cost: 0,
    cost_unit: 'EUR',
  })

  // clear input
  newItemId.value = ''
}
</script>

<template>
  <EditorBase
    v-model="transaction"
    object-type="transaction"
    :object-changed="transactionChanged"
    :object-source="transactionSource"
    :exists-in-store="existsInStore"
    title="Transaction Editor"
    :return-location="returnLocation"
    :saved-go-to-location="
      transaction !== undefined
        ? { name: 'transaction', params: { id: transaction.id } }
        : undefined
    "
    :deleted-go-to-location="{ name: 'transaction-list' }"
    :save="saveTransaction"
    :save-as-draft="saveTransactionAsDraft"
    :set-as-template="setTransactionAsTemplate"
    :delete="deleteTransaction"
    :discard-changes="discardChanges"
    :navigate-to="navigateTo"
    :reload="reloadTransaction"
  >
    <template v-if="transaction">
      <EditorFieldset label="Description">
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
      </EditorFieldset>

      <EditorFieldset label="Transaction Details">
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
                      view-mode="hour"
                      :use-seconds="true"
                    ></v-time-picker>
                  </v-menu>
                </v-text-field>
              </v-col>
            </v-row>
            <AutocompletePlace
              v-model="transaction.place_id"
              :show-number-of-transactions="true"
              @add-new-place="onAddNewLocation"
            ></AutocompletePlace>
          </v-col>
        </v-row>
      </EditorFieldset>

      <EditorFieldset label="Items" :class="{ ['pt-6']: transaction.items.length > 0 }">
        <v-row class="ms-0 me-0" v-for="(item, i) in transaction.items" :key="i">
          <v-col cols="12" lg="6" class="d-flex flex-row gc-5" :class="{ ['pb-0']: smAndDown }">
            <v-number-input
              v-model="item.amount"
              :min="1"
              :control-variant="xs ? 'hidden' : 'default'"
              label="Amount"
              min-width="5rem"
              width="max-content"
              hideDetails
            ></v-number-input>

            <!-- decimal-separator="," -->
            <v-number-input
              v-model="item.cost"
              :control-variant="xs ? 'hidden' : 'default'"
              :precision="2"
              :min="0.0"
              min-width="10rem"
              label="Cost (per unit)"
              hideDetails
            ></v-number-input>
            <v-select
              v-model="item.cost_unit"
              :items="costUnits"
              item-value="id"
              item-title="title"
              min-width="5rem"
              label="Currency"
              hideDetails
            ></v-select>
          </v-col>
          <v-col cols="12" lg="6" :class="{ ['pb-0']: smAndDown }">
            <AutocompleteItem v-model="item.item_id" readonly :clearable="false">
              <template #append>
                <v-btn flat icon="mdi-delete" @click="() => onRemoveItem(i)"></v-btn>
              </template>
            </AutocompleteItem>
          </v-col>
        </v-row>

        <v-divider
          class="mt-4 mb-4"
          :class="{ ['mt-7']: smAndDown }"
          v-if="transaction.items?.length > 0"
        ></v-divider>

        <AutocompleteItem v-model="newItemId" @on-new-item="onAddNewItem">
          <template #append>
            <v-btn @click="onAddItemToTransaction">Add item</v-btn>
          </template>
        </AutocompleteItem>
      </EditorFieldset>

      <!-- TODO: attachments -->
    </template>
  </EditorBase>
</template>
