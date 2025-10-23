<script setup lang="ts">
import { until } from '@vueuse/core'
import { computed, onMounted, ref, toRaw } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

import EditorConfirmChangesDialog from '@/components/EditorConfirmChangesDialog.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import EditorFieldsInternals from '@/components/EditorFieldsInternals.vue'
import EditorFieldsRelated from '@/components/EditorFieldsRelated.vue'
import type { Place } from '@/model/interfaces'
import { createNewPlace, isPlaceChanged } from '@/model/utils'
import { useAuditLogStore } from '@/stores/auditLog'
import { usePlacesStore } from '@/stores/places'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const placesStore = usePlacesStore()
const wipStore = useWorkInProgressStore()
const auditLog = useAuditLogStore()

const router = useRouter()
const route = useRoute()

const placeIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.query.returnTo !== undefined ? JSON.parse(route.query.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const existsAsDraft = computed(
  () => placeIdFromParam !== undefined && wipStore.has(placeIdFromParam),
)
const existsInStore = computed(
  () => placeIdFromParam !== undefined && placesStore.has(placeIdFromParam),
)
const placeSource = ref<'place-store' | 'wip-store' | 'new'>()
const placeBase = ref<Place>()
const place = ref<Place>()
const placeChanged = computed(() => isPlaceChanged(placeBase.value, place.value))

onMounted(async () => {
  let placeGot: Place | undefined = undefined
  if (placeIdFromParam !== undefined) {
    await until(() => wipStore.$isHydrated && placesStore.$isHydrated).toBeTruthy()

    if (existsAsDraft.value) {
      placeGot = wipStore.get<Place>(placeIdFromParam)!
      placeSource.value = 'wip-store'
    } else if (existsInStore.value) {
      placeGot = placesStore.get(placeIdFromParam)!
      placeSource.value = 'place-store'
    }
  } else {
    placeGot = createNewPlace()
    placeSource.value = 'new'
  }
  if (placeGot !== undefined) {
    placeBase.value = structuredClone(placeGot)
    place.value = placeGot
  }
})

function isValidURL(val: string) {
  return URL.canParse(val)
}

async function _safe(replaceHistory: boolean = true) {
  if (!place.value) return

  // update metadata and add/update in store
  if (existsInStore.value) place.value._meta.edited = new Date()
  await placesStore.add(place.value)

  // finish draft
  if (wipStore.has(place.value.id)) await wipStore.finish(place.value.id)

  // update base version, so no edit changes should be found
  placeBase.value = structuredClone(toRaw(place.value))
  placeSource.value = 'place-store'

  if (replaceHistory && route.name !== 'place-edit') {
    // do a history replace with place-edit and then use the browser history?
    await router.replace({ name: 'place-edit', params: { id: place.value.id }, query: route.query })
  }
}
async function _safeWIP(replaceHistory: boolean = true) {
  if (!place.value) return

  // do temp save to allow to return back here
  await wipStore.add(place.value.id, 'place-edit', toRaw(place.value))

  // update base version, so no edit changes should be found
  placeBase.value = structuredClone(toRaw(place.value))
  placeSource.value = 'wip-store'

  if (replaceHistory && route.name !== 'place-edit') {
    // do a history replace with place-edit and then use the browser history?
    await router.replace({ name: 'place-edit', params: { id: place.value.id }, query: route.query })
  }
}

async function onRelationEdit(id: string, type: string) {
  if (!place.value) return

  await _safeWIP()

  router.push({
    name: `${type}-edit`,
    params: { id: id },
    query: {
      returnTo: JSON.stringify({
        name: 'place-edit',
        params: { id: place.value.id },
        query: route.query,
      }),
    },
  })
}

async function onSave() {
  if (!place.value) return
  console.log('Save Place', toRaw(place.value))

  await _safe()

  if (returnLocation === undefined) {
    await router.push({ name: 'place-list' })
  } else {
    await router.push(returnLocation)
  }
}
async function onDelete() {
  if (!place.value) return
  console.log('Delete Place', toRaw(place.value))

  auditLog.add('Delete place', { place: toRaw(place.value) })
  await placesStore.remove(place.value)
  if (wipStore.has(place.value.id)) await wipStore.finish(place.value.id)

  if (returnLocation === undefined) {
    await router.push({ name: 'place-list' })
  } else {
    await router.push(returnLocation)
  }
}

async function onUserChoiceSave() {
  await _safe()
}
async function onUserChoiceSaveDraft() {
  await _safeWIP()
}
async function onUserChoiceDiscardChanges() {
  // reset editable object
  place.value = structuredClone(toRaw(placeBase.value))
}

const dialogToAskUserAboutChanges = ref<boolean>(false)
onBeforeRouteLeave(async (to, from) => {
  if (!place.value) return true

  // console.debug('onBeforeRouteLeave', `${String(from.name)} --> ${String(to.name)}`)
  if (from.name === 'place-new' && to.name === 'place-edit' && to.params.id === place.value.id) {
    return true
  }

  if (placeChanged.value) {
    dialogToAskUserAboutChanges.value = true
    return false
  }
})
</script>

<template>
  <h1 class="mb-3">Place / Location Editor<template v-if="placeChanged"> [changed]</template></h1>

  <v-form v-if="place">
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

    <EditorFieldsRelated
      :object="place"
      object-type="place"
      @edit="onRelationEdit"
    ></EditorFieldsRelated>

    <EditorFieldsInternals v-model:object="place"></EditorFieldsInternals>

    <div class="d-flex flex-column flex-sm-row ga-3 mt-3">
      <v-btn color="primary" text="Save" @click="onSave"></v-btn>
      <v-btn v-if="existsInStore" color="error" text="Delete" @click="onDelete"></v-btn>
    </div>
  </v-form>

  <EditorConfirmChangesDialog
    v-model="dialogToAskUserAboutChanges"
    :is-draft="placeSource === 'wip-store'"
    @save="onUserChoiceSave"
    @save-draft="onUserChoiceSaveDraft"
    @discard="onUserChoiceDiscardChanges"
  ></EditorConfirmChangesDialog>
</template>
