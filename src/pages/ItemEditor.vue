<script setup lang="ts">
import { until } from '@vueuse/core'
import { computed, onMounted, readonly, ref, toRaw } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

import EditorConfirmChangesDialog from '@/components/EditorConfirmChangesDialog.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import EditorFieldsInternals from '@/components/EditorFieldsInternals.vue'
import EditorFieldsRelated from '@/components/EditorFieldsRelated.vue'
import type { Item, ItemPart } from '@/model/interfaces'
import { COST_UNITS, ITEM_TYPES } from '@/model/interfaces'
import { createNewItem, isItemChanged } from '@/model/utils'
import { useAuditLogStore } from '@/stores/auditLog'
import { useItemsStore } from '@/stores/items'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const { smAndDown, xs } = useDisplay()

const itemsStore = useItemsStore()
const wipStore = useWorkInProgressStore()
const auditLog = useAuditLogStore()

const router = useRouter()
const route = useRoute()

const itemIdFromParam = route.params.id as string | undefined
const returnLocation = computed(
  () =>
    (route.query.returnTo !== undefined
      ? JSON.parse(route.query.returnTo as string)
      : undefined) as
      | string
      | RouteLocationAsRelativeGeneric
      | RouteLocationAsPathGeneric
      | undefined,
)

const existsAsDraft = computed(() => itemIdFromParam !== undefined && wipStore.has(itemIdFromParam))
const existsInStore = computed(
  () => itemIdFromParam !== undefined && itemsStore.has(itemIdFromParam),
)
const itemSource = ref<'item-store' | 'wip-store' | 'new'>()
const itemBase = ref<Item>()
const item = ref<Item>()
const itemChanged = computed(() => isItemChanged(itemBase.value, item.value))

onMounted(async () => {
  let itemGot: Item | undefined = undefined
  if (itemIdFromParam !== undefined) {
    await until(() => wipStore.$isHydrated && itemsStore.$isHydrated).toBeTruthy()

    if (existsAsDraft.value) {
      itemGot = wipStore.get<Item>(itemIdFromParam)!
      itemSource.value = 'wip-store'
    } else if (existsInStore.value) {
      itemGot = itemsStore.get(itemIdFromParam)!
      itemSource.value = 'item-store'
    }
  } else {
    itemGot = createNewItem()
    itemSource.value = 'new'
  }
  if (itemGot !== undefined) {
    itemBase.value = structuredClone(itemGot)
    item.value = itemGot
  }
})

const itemTypes = readonly(ITEM_TYPES)
const costUnits = readonly(COST_UNITS)

const item_ids = computed<{ id: string; label: string; item: Item }[]>(() =>
  Array.from(itemsStore.items.values())
    // NOTE: remove self from list
    // TODO: remove reference loops?
    .filter((item2) => item2.id !== (item.value?.id ?? itemIdFromParam))
    .map((item) => ({ id: item.id, label: item.name, item })),
)

async function _safe(replaceHistory: boolean = true) {
  if (!item.value) return

  // update metadata and add/update in store
  if (existsInStore.value) item.value._meta.edited = new Date()
  await itemsStore.add(item.value)

  // finish draft
  if (wipStore.has(item.value.id)) await wipStore.finish(item.value.id)

  // update base version, so no edit changes should be found
  itemBase.value = structuredClone(toRaw(item.value))
  itemSource.value = 'item-store'

  if (replaceHistory && route.name !== 'item-edit') {
    // do a history replace with item-edit and then use the browser history?
    await router.replace({ name: 'item-edit', params: { id: item.value.id }, query: route.query })
  }
}
async function _safeWIP(replaceHistory: boolean = true) {
  if (!item.value) return

  // do temp save to allow to return back here
  await wipStore.add(item.value.id, 'item-edit', toRaw(item.value))

  // update base version, so no edit changes should be found
  itemBase.value = structuredClone(toRaw(item.value))
  itemSource.value = 'wip-store'

  if (replaceHistory) {
    // do a history replace with item-edit and then use the browser history?
    await router.replace({ name: 'item-edit', params: { id: item.value.id }, query: route.query })
  }
}

function onAddOneMorePart() {
  if (!item.value) return
  item.value.contents?.push({
    amount: 1,
    type: '',
  })
}
function onRemovePart(part_idx: number) {
  if (!item.value) return
  item.value.contents = item.value.contents?.filter((_val, idx) => idx !== part_idx) ?? []
}

async function onAddNewItem() {
  if (!item.value) return

  await _safeWIP()

  // otherwise, would it work with multiple levels of redirection? --> ToBeTested
  await router.push({
    // 'item-new' only works if we set a :key on <router-view> to force rerendering
    name: 'item-new',
    query: {
      returnTo: JSON.stringify({
        name: 'item-edit',
        params: { id: item.value.id },
        query: route.query,
      }),
    },
  })
}
function onItemPartItemSelected(part: ItemPart) {
  if (part.item_id !== undefined) {
    const partItem = itemsStore.get(part.item_id)
    console.log('partItem', partItem)
    if (partItem !== undefined) {
      if (!part.name || part.name.trim().length === 0) {
        part.name = partItem.name
      }
      if (!part.type || part.type.trim().length === 0) {
        part.type = partItem.type
      }
    }
  }
}

async function onRelationEdit(id: string, type: string) {
  if (!item.value) return

  await _safeWIP()

  router.push({
    name: `${type}-edit`,
    params: { id: id },
    query: {
      returnTo: JSON.stringify({
        name: 'item-edit',
        params: { id: item.value.id },
        query: route.query,
      }),
    },
  })
}

async function onSave() {
  if (!item.value) return
  console.log('Save Item', toRaw(item.value))

  await _safe()

  if (returnLocation.value === undefined) {
    await router.push({ name: 'item-list' })
  } else {
    await router.push(returnLocation.value)
  }
}
async function onDelete() {
  if (!item.value) return
  console.log('Delete Item', toRaw(item.value))

  auditLog.add('Delete item', { item: toRaw(item.value) })
  await itemsStore.remove(item.value)
  if (wipStore.has(item.value.id)) await wipStore.finish(item.value.id)

  if (returnLocation.value === undefined) {
    await router.push({ name: 'item-list' })
  } else {
    await router.push(returnLocation.value)
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
  item.value = structuredClone(toRaw(itemBase.value))
}

const dialogToAskUserAboutChanges = ref<boolean>(false)
onBeforeRouteLeave(async (to, from) => {
  if (!item.value) return true

  // console.debug('onBeforeRouteLeave', `${String(from.name)} --> ${String(to.name)}`)
  if (from.name === 'item-new' && to.name === 'item-edit' && to.params.id === item.value.id) {
    return true
  }

  if (itemChanged.value) {
    dialogToAskUserAboutChanges.value = true
    return false
  }
})
</script>

<template>
  <h1 class="mb-3">Item Editor<template v-if="itemChanged"> [changed]</template></h1>

  <v-form v-if="item">
    <EditorFieldset label="Details">
      <v-autocomplete
        v-model="item.type"
        :items="itemTypes"
        item-value="id"
        item-title="label"
        label="Item Type"
      ></v-autocomplete>

      <v-text-field
        v-model="item.name"
        label="Name"
        :rules="[(val: string) => !!val && val.trim().length > 0]"
      ></v-text-field>
      <v-textarea v-model="item.description" label="Description"></v-textarea>
    </EditorFieldset>

    <EditorFieldset label="Parts">
      <v-row class="ga-5 ms-0 me-0 mb-5" v-for="(part, i) in item.contents" :key="i">
        <v-number-input
          v-model="part.amount"
          :min="1"
          :control-variant="xs ? 'hidden' : 'default'"
          label="Amount"
          hide-details
          min-width="5rem"
          width="max-content"
        ></v-number-input>
        <v-combobox
          v-model="part.type"
          :items="itemTypes"
          item-value="id"
          item-title="label"
          label="Type"
          clearable
          hide-details
        ></v-combobox>
        <v-text-field
          v-model="part.name"
          label="Label"
          hide-details
          min-width="5rem"
        ></v-text-field>
        <v-autocomplete
          v-model="part.item_id"
          :items="item_ids"
          item-title="label"
          item-value="id"
          @update:model-value="() => onItemPartItemSelected(part)"
          hide-details
          clearable
          min-width="5rem"
          label="Item"
        >
          <template v-slot:no-data>
            <v-list-item>
              <v-list-item-action @click="onAddNewItem">Create new Item</v-list-item-action>
            </v-list-item>
          </template>
          <template v-slot:append>
            <v-btn flat icon="mdi-delete" @click="() => onRemovePart(i)"></v-btn>
          </template>
        </v-autocomplete>
      </v-row>

      <v-btn @click="onAddOneMorePart">Add more parts</v-btn>
    </EditorFieldset>

    <EditorFieldset label="Cost information">
      <v-row>
        <!-- TODO: breakpoints with nesting are weird -->
        <v-col sm="6" cols="12" :class="smAndDown && 'pb-0'">
          <!-- decimal-separator="," -->
          <v-number-input
            v-model="item.cost"
            :precision="2"
            :min="0.0"
            label="Cost (MSRP/UVP)"
          ></v-number-input>
        </v-col>
        <v-col sm="6" cols="12" :class="{ ['pb-0']: smAndDown, ['pt-0']: xs }">
          <v-select
            v-model="item.cost_unit"
            :items="costUnits"
            item-value="id"
            item-title="title"
            label="Currency"
          ></v-select>
        </v-col>
      </v-row>
    </EditorFieldset>

    <EditorFieldsRelated
      :object="item"
      object-type="item"
      @edit="onRelationEdit"
    ></EditorFieldsRelated>

    <EditorFieldsInternals v-model:object="item"></EditorFieldsInternals>

    <div class="d-flex flex-column flex-sm-row ga-3 mt-3">
      <v-btn color="primary" text="Save" @click="onSave"></v-btn>
      <v-btn v-if="existsInStore" color="error" text="Delete" @click="onDelete"></v-btn>
    </div>
  </v-form>

  <p v-else>Loading ...</p>

  <EditorConfirmChangesDialog
    v-model="dialogToAskUserAboutChanges"
    :is-draft="itemSource === 'wip-store'"
    @save="onUserChoiceSave"
    @save-draft="onUserChoiceSaveDraft"
    @discard="onUserChoiceDiscardChanges"
  ></EditorConfirmChangesDialog>
</template>
