<script setup lang="ts">
import { computed } from 'vue'

import EditorFieldset from '@/components/EditorFieldset.vue'
import { COST_UNITS } from '@/model/interfaces'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
const currencies = useCurrencyStore()

const currencyDateLatest = computed({
  get: () => currencies.requestDate === 'latest',
  set: (v: boolean) => {
    const d = new Date()
    d.setHours(12)
    currencies.requestDate = v ? 'latest' : d.toISOString().slice(0, 10)
  },
})
const currencyDate = computed({
  get: () => (currencies.requestDate !== 'latest' ? new Date(currencies.requestDate) : new Date()),
  set: (v: Date) => {
    v.setHours(12)
    console.debug('[currencyDate:set]', v)
    currencies.requestDate = v.toISOString().slice(0, 10)
  },
})
const currencyDateDisplay = computed(() =>
  currencies.dateIsLatest ? 'latest exchange rates' : currencyDate.value.toLocaleDateString(),
)

async function onCurrencyRefresh() {
  currencies.refresh()
}
</script>

<template>
  <h1 class="mb-3">Application Settings</h1>

  <v-form>
    <EditorFieldset label="Editor (debug options)">
      <p class="text-medium-emphasis">
        Changing the following checkboxes will take effect immediately.
      </p>

      <v-checkbox
        v-model="settings.editorShowInternalID"
        hide-details
        label="Show internal identifiers"
      ></v-checkbox>

      <v-checkbox
        v-model="settings.editorShowObjectInternals"
        hide-details
        label="Show object internals (creation/modification time, ID)"
      ></v-checkbox>
      <v-checkbox
        v-model="settings.editorShowObjectRelations"
        hide-details
        label="Show object relations (in-/outgoing)"
      ></v-checkbox>
    </EditorFieldset>

    <EditorFieldset label="Currency Exchange Rates">
      <p class="text-medium-emphasis">
        The default currency for costs and values. Information in other currencies will be converted
        using the exchange rates below.
      </p>

      <v-row>
        <v-col cols="12" sm="6">
          <v-autocomplete
            v-model="currencies.baseCurrency"
            :items="COST_UNITS"
            item-title="title"
            item-value="id"
            label="Base Currency"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field :model-value="currencyDateDisplay" label="Date" readonly>
            <v-menu :close-on-content-click="false" activator="parent" min-width="0">
              <v-date-picker
                v-model="currencyDate"
                :max="new Date()"
                :min="currencyDateLatest ? new Date() : undefined"
                :readonly="currencyDateLatest"
                show-adjacent-months
              >
                <template #actions>
                  <v-checkbox
                    v-model="currencyDateLatest"
                    label="Use latest exchange rates"
                    class="ma-0 flex-1-1"
                    hide-details
                  ></v-checkbox>
                </template>
              </v-date-picker>
            </v-menu>

            <template #append>
              <v-btn prepend-icon="mdi-refresh" @click="onCurrencyRefresh">Refresh</v-btn>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <v-list density="compact" v-if="currencies.exchangeRates">
        <v-list-item class="border-b mb-2"
          ><strong>Updated</strong>: {{ currencies.updateDate }}</v-list-item
        >
        <v-list-item v-for="[unit, rate] in currencies.exchangeRates" :key="unit"
          ><strong>{{ unit }}</strong
          >: <code>{{ rate.toFixed(5).padStart(12, '&nbsp;') }}</code></v-list-item
        >
      </v-list>
    </EditorFieldset>

    <!-- Templates: enabled -->
    <!-- Privacy: hide transactions, currency numbers -->
  </v-form>
</template>
