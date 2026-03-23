<script setup lang="ts">
import { computed, ref } from 'vue'

import EditorBase from '@/components/EditorBase.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import useEditorObject from '@/composables/useEditorObject'
import type { PlaceLocalFair } from '@/model/interfaces'
import { ONLINE_MARKETPLACE } from '@/model/interfaces'
import { usePlacesStore } from '@/stores/places'
import { highlightAutocompleteItem } from '@/utils/autocomplete'

const placesStore = usePlacesStore()

const {
  object: place,
  objectSource: placeSource,
  objectChanged: placeChanged,
  existsInStore,
  returnLocation,
  setAsTemplate: setPlaceAsTemplate,
  saveAsDraft: savePlaceAsDraft,
  save: savePlace,
  delete: deletePlace,
  discardChanges,
  navigateTo,
  reload: reloadPlace,
} = useEditorObject('place')

const marketplaceSearch = ref<string>('')
const fairSearch = ref<string>('')

interface NameWithCountItem {
  name: string
  count: number
}
const fairNames = computed(() => {
  // TODO: may be able to autocomplete address or other details?
  const localFairs = Array.from(placesStore.places.values()).filter(
    (place) => place.type === 'local-fair',
  )

  const names = localFairs
    .map((fairPlace) => fairPlace.fair)
    .reduce((map, cur) => map.set(cur, (map.get(cur) ?? 0) + 1), new Map<string, number>())

  return Array.from(names.entries())
    .sort()
    .map(([name, count]) => ({ name, count })) as NameWithCountItem[]
})
const marketplaceNameToCount = computed(() => {
  const onlineMarketplaces = Array.from(placesStore.places.values()).filter(
    (place) => place.type === 'online-marketplace',
  )

  const names = onlineMarketplaces
    .map((mpPlace) => mpPlace.marketplace)
    .reduce((map, cur) => map.set(cur, (map.get(cur) ?? 0) + 1), new Map<string, number>())

  return names
})

function isValidURL(val: string) {
  return URL.canParse(val)
}
function isValidFairName(val: string | NameWithCountItem) {
  if (typeof val === 'object' && Object.hasOwn(val, 'name')) {
    val = val.name
  }
  return !!val && typeof val === 'string' && val.trim().length > 0
}
</script>

<template>
  <EditorBase
    v-model="place"
    object-type="place"
    :object-changed="placeChanged"
    :object-source="placeSource"
    :exists-in-store="existsInStore"
    title="Place / Location Editor"
    :return-location="returnLocation"
    :saved-go-to-location="{ name: 'place-list' }"
    :deleted-go-to-location="{ name: 'place-list' }"
    :save="savePlace"
    :save-as-draft="savePlaceAsDraft"
    :set-as-template="setPlaceAsTemplate"
    :delete="deletePlace"
    :discard-changes="discardChanges"
    :navigate-to="navigateTo"
    :reload="reloadPlace"
  >
    <template v-if="place">
      <v-input hide-details>
        <!-- TODO: toggle revalidation? -->
        <v-btn-toggle v-model="place.type" divided>
          <v-btn value="local-store">
            <span class="hidden-sm-and-down">Local Store</span>
            <v-icon icon="mdi-store" end></v-icon>
          </v-btn>
          <v-btn value="local-fair">
            <span class="hidden-sm-and-down">Trade Fair</span>
            <v-icon icon="mdi-storefront" end></v-icon>
          </v-btn>
          <v-btn value="online-shop">
            <span class="hidden-sm-and-down">Online Store</span>
            <v-icon icon="mdi-web" end></v-icon>
          </v-btn>
          <v-btn value="online-marketplace">
            <span class="hidden-sm-and-down">Online Marketplace</span>
            <v-icon icon="mdi-shopping" end></v-icon>
          </v-btn>
        </v-btn-toggle>

        <template #prepend>
          <div class="text-subtitle">Select store type:</div>
        </template>
      </v-input>

      <EditorFieldset label="Details">
        <v-text-field
          v-model="place.name"
          label="Name"
          :rules="[(val: string) => !!val && val.trim().length > 0]"
        ></v-text-field>

        <v-combobox
          v-if="place.type === 'local-fair'"
          v-model="(place as PlaceLocalFair).fair"
          v-model:search="fairSearch"
          :items="fairNames"
          item-value="name"
          item-title="name"
          label="Trade Fair / Show"
          clearable
          :rules="[isValidFairName]"
        >
          <template #item="{ props, item, internalItem }">
            <v-list-item v-bind="props">
              <template #title
                ><component :is="() => highlightAutocompleteItem(internalItem, fairSearch)"
              /></template>
              <template #subtitle>{{ item.count }} place{{ item.count !== 1 ? 's' : '' }}</template>
            </v-list-item>
          </template>
        </v-combobox>

        <v-textarea
          v-if="place.type === 'local-store' || place.type === 'local-fair'"
          v-model="place.address"
          label="Address"
        ></v-textarea>

        <v-autocomplete
          v-if="place.type === 'online-marketplace'"
          v-model="place.marketplace"
          v-model:search="marketplaceSearch"
          :items="ONLINE_MARKETPLACE"
          item-value="id"
          item-title="label"
          label="Marketplace"
        >
          <template #item="{ props, item, internalItem }">
            <v-list-item
              v-bind="props"
              :prepend-avatar="`/marketplace-logos/${internalItem.value}.png`"
            >
              <template #prepend
                ><v-avatar :style="{ '--v-avatar-height': '24px' }"></v-avatar
              ></template>
              <template #title
                ><component :is="() => highlightAutocompleteItem(internalItem, marketplaceSearch)"
              /></template>
              <template #subtitle
                >{{ marketplaceNameToCount.get(item.id) ?? 0 }} place{{
                  (marketplaceNameToCount.get(item.id) ?? 0) !== 1 ? 's' : ''
                }}</template
              >
            </v-list-item>
          </template>
        </v-autocomplete>

        <v-text-field
          v-model="place.url"
          label="URL"
          :rules="[
            (val: string) =>
              (place?.type !== 'online-shop' && place?.type !== 'online-marketplace') ||
              isValidURL(val),
          ]"
        ></v-text-field>
      </EditorFieldset>
    </template>
  </EditorBase>
</template>
