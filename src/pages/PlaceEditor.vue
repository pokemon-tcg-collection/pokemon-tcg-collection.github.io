<script setup lang="ts">
import { ref, toRaw } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

import type { Place } from '@/model/interfaces'
import { createNewPlace } from '@/model/utils'
import { useAuditLogStore } from '@/stores/auditLog'
import { usePlacesStore } from '@/stores/places'
import { useSettingsStore } from '@/stores/settings'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const placesStore = usePlacesStore()
const wipStore = useWorkInProgressStore()
const settings = useSettingsStore()
const auditLog = useAuditLogStore()

const router = useRouter()
const route = useRoute()

const placeIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.query.returnTo !== undefined ? JSON.parse(route.query.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const existsInStore = placeIdFromParam !== undefined && placesStore.has(placeIdFromParam)
const place = ref<Place>(
  placeIdFromParam !== undefined && wipStore.has(placeIdFromParam)
    ? wipStore.get<Place>(placeIdFromParam)!
    : existsInStore
      ? placesStore.get(placeIdFromParam)!
      : createNewPlace(),
)

async function onSave() {
  console.log('Save Place', toRaw(place.value))

  await placesStore.add(place.value)
  if (wipStore.has(place.value.id)) await wipStore.finish(place.value.id)

  // do a history replace with place-edit and then use the browser history?
  await router.replace({ name: 'place-edit', params: { id: place.value.id }, query: route.query })

  if (returnLocation === undefined) {
    await router.push({ name: 'place-list' })
  } else {
    await router.push(returnLocation)
  }
}
async function onDelete() {
  console.log('Delete Place', toRaw(place.value))

  auditLog.add('Delete place', { place: toRaw(place.value) })
  await placesStore.remove(place.value)
  if (wipStore.has(place.value.id)) await wipStore.finish(place.value.id)

  await router.push({ name: 'place-list' })
}
</script>

<template>
  <h1 class="mb-3">Place / Location Editor</h1>

  <v-form>
    <v-input hide-details>
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

    <fieldset class="pa-3 my-2" v-if="settings.editorShowInternalID">
      <legend>Internals</legend>
      <v-text-field
        v-if="settings.editorShowInternalID"
        v-model="place.id"
        readonly
        label="Internal Place ID"
      ></v-text-field>
    </fieldset>

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
