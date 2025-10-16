<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { ref, toRaw } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

import type { Place } from '@/model/interfaces'
import { usePlacesStore } from '@/stores/places'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const placesStore = usePlacesStore()
const wipStore = useWorkInProgressStore()

const router = useRouter()
const route = useRoute()

const placeIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.params.returnTo !== undefined ? JSON.parse(route.params.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const place = ref<Place>(
  placeIdFromParam !== undefined && wipStore.has(placeIdFromParam)
    ? wipStore.get<Place>(placeIdFromParam)!
    : placeIdFromParam !== undefined && placesStore.has(placeIdFromParam)
      ? placesStore.get(placeIdFromParam)!
      : {
          id: uuidv4(),
          type: 'online',
          name: '',
          url: '',
        },
)

function onPlaceTypeChange(placeType: string) {
  console.debug('Change of place type', placeType)
}

async function onSave() {
  console.log('Save Place', toRaw(place.value))

  placesStore.add(place.value)
  if (wipStore.has(place.value.id)) wipStore.finish(place.value.id)

  // do a history replace with place-edit and then use the browser history?
  await router.replace({ name: 'place-edit', params: { id: place.value.id }, query: route.query })

  if (returnLocation === undefined) {
    await router.push({ name: 'place-list', params: { id: place.value.id } })
  } else {
    await router.push(returnLocation)
  }
}
</script>

<template>
  <h1 class="mb-3">Place / Location Editor</h1>

  <v-form>
    <v-input hide-details>
      <v-btn-toggle v-model="place.type" @update:model-value="onPlaceTypeChange" divided>
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

    <fieldset class="pa-3 my-2">
      <legend>Details</legend>

      <v-text-field v-model="place.name" label="Name" required></v-text-field>

      <v-textarea
        v-if="place.type === 'local'"
        v-model="place.address"
        label="Address"
      ></v-textarea>

      <v-text-field
        v-model="place.url"
        label="URL"
        :required="place.type === 'online'"
      ></v-text-field>
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Additional</legend>

      <v-textarea v-model="place.notes" label="Notes"></v-textarea>
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Internals</legend>
      <v-text-field v-model="place.id" readonly label="Internal Card ID"></v-text-field>
    </fieldset>

    <v-btn color="primary" text="Save" @click="onSave"></v-btn>
  </v-form>
</template>

<style lang="css" scoped>
fieldset > legend {
  padding-inline: 0.3rem;
}
</style>
