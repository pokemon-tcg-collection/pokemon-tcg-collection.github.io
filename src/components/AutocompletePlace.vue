<script setup lang="ts">
import { computed, ref } from 'vue'

import type { Place, RefID } from '@/model/interfaces'
import { ONLINE_MARKETPLACE, PLACE_TYPE } from '@/model/interfaces'
import { gatherPlaceIncomingRelations } from '@/stores/_relations'
import { usePlacesStore } from '@/stores/places'
import { highlightAutocompleteItem, highlightAutocompleteItemValue } from '@/utils/autocomplete'

const model = defineModel<RefID | undefined>()
const search = ref<string>('')

const { showNumberOfTransactions } = defineProps<{ showNumberOfTransactions?: boolean }>()

const emit = defineEmits<{
  addNewPlace: []
}>()

const placesStore = usePlacesStore()

interface PlaceItem {
  id: string
  label: string
  type_label: string | undefined
  marketplace_label: string | undefined
  numberOfTransactions: number | undefined
  place: Place
}
const placeItems = computed<PlaceItem[]>(() =>
  (Array.from(placesStore.places.values()) as Place[]).map((place) => {
    const placeType = place.type
    const placeTypeLabel = PLACE_TYPE.find((pt) => pt.id == placeType)?.label

    let marketplaceLabel: string | undefined = undefined
    if (placeType == 'online-marketplace') {
      marketplaceLabel = ONLINE_MARKETPLACE.find((om) => om.id == place.marketplace)?.label
    }

    // compute number of transactions (all references?)
    let numberOfTransactions: number | undefined = undefined
    if (showNumberOfTransactions) {
      const relations = gatherPlaceIncomingRelations(place, ['transaction'])
      numberOfTransactions = relations.length
    }

    return {
      id: place.id,
      label: place.name,
      type_label: placeTypeLabel,
      marketplace_label: marketplaceLabel,
      numberOfTransactions: numberOfTransactions,
      place,
    }
  }),
)

function onAddNewPlace() {
  // TODO: use `v-model:search="input"` to use suggestion text as new place title (prefill form)
  emit('addNewPlace')
}
</script>

<template>
  <v-autocomplete
    v-model="model"
    v-model:search="search"
    :items="placeItems"
    :filter-keys="['title', 'raw.type_label', 'raw.marketplace_label']"
    item-title="label"
    item-value="id"
    clearable
    label="Location"
    prepend-icon="mdi-store-marker"
  >
    <template #item="{ props, item }">
      <v-list-item v-bind="props">
        <template #title
          ><component :is="() => highlightAutocompleteItem(item, search)"
        /></template>
        <template #subtitle
          ><component
            :is="() => highlightAutocompleteItemValue(item.raw.type_label, search)"
          /><template v-if="item.raw.marketplace_label"
            >{{ ' | '
            }}<component
              :is="
                () => highlightAutocompleteItemValue(item.raw.marketplace_label, search)
              " /></template
          ><template
            v-if="item.raw.numberOfTransactions !== undefined && item.raw.numberOfTransactions > 0"
            >{{ ' | ' }}{{ item.raw.numberOfTransactions }} transaction{{
              item.raw.numberOfTransactions !== 1 ? 's' : ''
            }}</template
          ></template
        >
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item @click="onAddNewPlace">Create a new Location</v-list-item>
    </template>
  </v-autocomplete>
</template>
