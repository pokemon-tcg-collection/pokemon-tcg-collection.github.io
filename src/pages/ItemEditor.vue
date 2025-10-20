<script setup lang="ts">
import { readonly, ref, toRaw } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

import EditorFieldsInternals from '@/components/EditorFieldsInternals.vue'
import type { Item, ItemPart } from '@/model/interfaces'
import { COST_UNITS, ITEM_TYPES } from '@/model/interfaces'
import { createNewItem } from '@/model/utils'
import { useAuditLogStore } from '@/stores/auditLog'
import { useItemsStore } from '@/stores/items'
import { useWorkInProgressStore } from '@/stores/workInProgress'
import { computed } from 'vue'

const { smAndDown, xs } = useDisplay()

const itemsStore = useItemsStore()
const wipStore = useWorkInProgressStore()
const auditLog = useAuditLogStore()

const router = useRouter()
const route = useRoute()

const itemIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.query.returnTo !== undefined ? JSON.parse(route.query.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const existsInStore = itemIdFromParam !== undefined && itemsStore.has(itemIdFromParam)
const item = ref<Item>(
  itemIdFromParam !== undefined && wipStore.has(itemIdFromParam)
    ? wipStore.get<Item>(itemIdFromParam)!
    : existsInStore
      ? itemsStore.get(itemIdFromParam)!
      : createNewItem(),
)

const itemTypes = readonly(ITEM_TYPES)
const costUnits = readonly(COST_UNITS)

const item_ids = computed<{ id: string; label: string; item: Item }[]>(() =>
  Array.from(itemsStore.items.values())
    // NOTE: remove self from list
    // TODO: remove reference loops?
    .filter((item2) => item2.id !== item.value.id)
    .map((item) => ({ id: item.id, label: item.name, item })),
)

function onAddOneMorePart() {
  item.value.contents?.push({
    amount: 1,
    type: '',
  })
}
function onRemovePart(part_idx: number) {
  item.value.contents = item.value.contents?.filter((_val, idx) => idx !== part_idx) ?? []
}

async function onAddNewItem() {
  // do temp save to allow to return back here
  await wipStore.add(item.value.id, 'item-edit', toRaw(item.value))

  // do a history replace with item-edit and then use the browser history?
  await router.replace({ name: 'item-edit', params: { id: item.value.id }, query: route.query })
  // otherwise, would it work with multiple levels of redirection? --> ToBeTested
  await router.push({
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

async function onSave() {
  console.log('Save Item', toRaw(item.value))

  if (existsInStore) item.value._meta.edited = new Date()
  await itemsStore.add(item.value)
  if (wipStore.has(item.value.id)) await wipStore.finish(item.value.id)

  // do a history replace with item-edit and then use the browser history?
  await router.replace({ name: 'item-edit', params: { id: item.value.id }, query: route.query })

  if (returnLocation === undefined) {
    await router.push({ name: 'item-list' })
  } else {
    await router.push(returnLocation)
  }
}
async function onDelete() {
  console.log('Delete Item', toRaw(item.value))

  auditLog.add('Delete item', { item: toRaw(item.value) })
  await itemsStore.remove(item.value)
  if (wipStore.has(item.value.id)) await wipStore.finish(item.value.id)

  if (returnLocation === undefined) {
    await router.push({ name: 'item-list' })
  } else {
    await router.push(returnLocation)
  }
}
</script>

<template>
  <h1 class="mb-3">Item Editor</h1>

  <v-form>
    <fieldset class="pa-3 my-2">
      <legend>Details</legend>

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
    </fieldset>

    <fieldset class="pa-3 my-2 pt-6">
      <legend>Parts</legend>

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
    </fieldset>

    <fieldset class="pa-3 my-2">
      <legend>Cost information</legend>

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
    </fieldset>

    <EditorFieldsInternals v-model:object="item"></EditorFieldsInternals>

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
