<script setup lang="ts">
import { toRaw } from 'vue'
import { useRouter } from 'vue-router'

import EditorBase from '@/components/EditorBase.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import useEditorObject from '@/composables/useEditorObject'
import type { EditRouteNames } from '@/router/routes'

const router = useRouter()

const {
  object: place,
  objectSource: placeSource,
  objectChanged: placeChanged,
  existsInStore,
  returnLocation,
  saveAsDraft: savePlaceAsDraft,
  save: savePlace,
  delete: deletePlace,
  discardChanges,
  navigateTo,
} = useEditorObject('place')

function isValidURL(val: string) {
  return URL.canParse(val)
}

async function onRelationEdit(id: string, type: string) {
  if (!place.value) return

  await savePlaceAsDraft()
  await navigateTo(`${type}-edit` as EditRouteNames, { id })
}

async function onSave() {
  if (!place.value) return
  console.log('Save Place', toRaw(place.value))

  await savePlace()

  if (returnLocation.value === undefined) {
    await router.push({ name: 'place-list' })
  } else {
    await router.push(returnLocation.value)
  }
}
async function onDelete() {
  if (!place.value) return
  console.log('Delete Place', toRaw(place.value))

  await deletePlace()

  if (returnLocation.value === undefined) {
    await router.push({ name: 'place-list' })
  } else {
    await router.push(returnLocation.value)
  }
}
async function onLeave(type: 'save' | 'save-draft' | 'discard-changes') {
  if (type === 'save') {
    await savePlace()
  } else if (type === 'save-draft') {
    await savePlaceAsDraft()
  } else if (type === 'discard-changes') {
    discardChanges()
  }
}
</script>

<template>
  <EditorBase
    v-model="place"
    object-type="place"
    :object-changed="placeChanged"
    :exists-in-store="existsInStore"
    :is-draft="placeSource === 'wip'"
    title="Place / Location Editor"
    @save="onSave"
    @delete="onDelete"
    @leave-action="onLeave"
    @relation-edit="onRelationEdit"
  >
    <template v-if="place">
      <v-input hide-details>
        <!-- TODO: toggle revalidation? -->
        <v-btn-toggle v-model="place.type" divided>
          <v-btn value="local">
            <span class="hidden-sm-and-down">Local Store</span>
            <v-icon icon="mdi-store" end></v-icon>
          </v-btn>
          <v-btn value="online">
            <span class="hidden-sm-and-down">Online Store</span>
            <v-icon icon="mdi-web" end></v-icon>
          </v-btn>
        </v-btn-toggle>

        <template v-slot:prepend>
          <div class="text-subtitle">Select store type:</div>
        </template>
      </v-input>

      <EditorFieldset label="Details">
        <v-text-field
          v-model="place.name"
          label="Name"
          :rules="[(val: string) => !!val && val.trim().length > 0]"
        ></v-text-field>

        <v-textarea
          v-if="place.type === 'local'"
          v-model="place.address"
          label="Address"
        ></v-textarea>

        <v-text-field
          v-model="place.url"
          label="URL"
          :rules="[(val: string) => place?.type !== 'online' || isValidURL(val)]"
        ></v-text-field>
      </EditorFieldset>

      <EditorFieldset label="Additional">
        <v-textarea v-model="place.notes" label="Notes"></v-textarea>
      </EditorFieldset>
    </template>
  </EditorBase>
</template>
