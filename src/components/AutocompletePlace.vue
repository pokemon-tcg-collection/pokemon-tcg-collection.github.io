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
  fair_label: string | undefined
  numberOfTransactions: number | undefined
  place: Place
}
const placeItems = computed<PlaceItem[]>(() =>
  (Array.from(placesStore.places.values()) as Place[]).map((place) => {
    const placeType = place.type
    const placeTypeLabel = PLACE_TYPE.find((pt) => pt.id == placeType)?.label

    let marketplaceLabel: string | undefined = undefined
    if (placeType === 'online-marketplace') {
      marketplaceLabel = ONLINE_MARKETPLACE.find((om) => om.id == place.marketplace)?.label
    }

    let fairLabel: string | undefined = undefined
    if (placeType === 'local-fair') {
      fairLabel = place.fair
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
      fair_label: fairLabel,
      numberOfTransactions: numberOfTransactions,
      place,
    }
  }),
)

const placeItemsGrouped = computed(() => {
  const items: (PlaceItem | { type: 'subheader'; title: string } | { type: 'divider' })[] = []

  PLACE_TYPE.forEach(({ id: placeType, label }) => {
    const subitems = placeItems.value.filter((pi) => pi.place.type == placeType)
    if (subitems.length > 0) {
      if (items.length > 0) {
        items.push({ type: 'divider' })
      }
      items.push({ type: 'subheader', title: label })
      items.push(...subitems)
    }
  })

  return items
})

function onAddNewPlace() {
  // TODO: use `v-model:search="input"` to use suggestion text as new place title (prefill form)
  emit('addNewPlace')
}
</script>

<template>
  <v-autocomplete
    v-model="model"
    v-model:search="search"
    :items="placeItemsGrouped"
    :filter-keys="['title', 'raw.type_label', 'raw.marketplace_label', 'raw.fair_label']"
    item-title="label"
    item-value="id"
    item-type="type"
    auto-select-first
    clearable
    label="Location"
    prepend-icon="mdi-store-marker"
  >
    <template #divider="{ props, index }">
      <v-divider v-if="index > 0" v-bind="props" :key="`divider-${index}`" class="mt-3"></v-divider>
    </template>
    <template #subheader="{ props, index }">
      <v-list-subheader v-bind="props" :key="`subheader-${index}`"></v-list-subheader>
    </template>
    <template #item="{ props, internalItem, item }">
      <v-list-item v-bind="props">
        <template #title
          ><component :is="() => highlightAutocompleteItem(internalItem, search)"
        /></template>
        <template #subtitle
          ><component
            :is="() => highlightAutocompleteItemValue((item as PlaceItem).type_label, search)"
          /><template v-if="(item as PlaceItem).marketplace_label"
            >{{ ' | '
            }}<component
              :is="
                () => highlightAutocompleteItemValue((item as PlaceItem).marketplace_label, search)
              " /></template
          ><template v-if="(item as PlaceItem).fair_label"
            >{{ ' | '
            }}<component
              :is="
                () => highlightAutocompleteItemValue((item as PlaceItem).fair_label, search)
              " /></template
          ><template
            v-if="
              (item as PlaceItem).numberOfTransactions !== undefined &&
              ((item as PlaceItem).numberOfTransactions as number) > 0
            "
            >{{ ' | ' }}{{ (item as PlaceItem).numberOfTransactions }} transaction{{
              (item as PlaceItem).numberOfTransactions !== 1 ? 's' : ''
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
