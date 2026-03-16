<script setup lang="ts">
import { ref } from 'vue'

import EditorBase from '@/components/EditorBase.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import useEditorObject from '@/composables/useEditorObject'
import { ONLINE_MARKETPLACE } from '@/model/interfaces'
import { highlightAutocompleteItem } from '@/utils/autocomplete'

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

function isValidURL(val: string) {
  return URL.canParse(val)
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

        <v-text-field
          v-if="place.type === 'local-fair'"
          v-model="place.fair"
          label="Trade Fair / Show"
          :rules="[(val: string) => !!val && val.trim().length > 0]"
        ></v-text-field>

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
          <template #item="{ props, item }">
            <v-list-item v-bind="props" :prepend-avatar="`/marketplace-logos/${item.value}.png`">
              <template #prepend>
                <v-avatar :style="{ '--v-avatar-height': '24px' }"></v-avatar>
              </template>
              <template #title
                ><component :is="() => highlightAutocompleteItem(item, marketplaceSearch)"
              /></template>
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
