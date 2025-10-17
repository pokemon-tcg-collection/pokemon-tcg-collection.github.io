<script setup lang="ts">
import { readonly, ref, toRaw } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

import type { Item } from '@/model/interfaces'
import { COST_UNITS, ITEM_TYPES } from '@/model/interfaces'
import { createNewItem } from '@/model/utils'
import { useItemsStore } from '@/stores/items'
import { useSettingsStore } from '@/stores/settings'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const { smAndDown, xs } = useDisplay()

const itemsStore = useItemsStore()
const wipStore = useWorkInProgressStore()
const settings = useSettingsStore()

const router = useRouter()
const route = useRoute()

const itemIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.query.returnTo !== undefined ? JSON.parse(route.query.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const item = ref<Item>(
  itemIdFromParam !== undefined && wipStore.has(itemIdFromParam)
    ? wipStore.get<Item>(itemIdFromParam)!
    : itemIdFromParam !== undefined && itemsStore.has(itemIdFromParam)
      ? itemsStore.get(itemIdFromParam)!
      : createNewItem(),
)

const itemTypes = readonly(ITEM_TYPES)
const costUnits = readonly(COST_UNITS)

function onAddOneMorePart() {
  item.value.contents?.push({
    amount: 1,
    type: '',
  })
}
function onRemovePart(part_idx: number) {
  item.value.contents = item.value.contents?.filter((_val, idx) => idx !== part_idx) ?? []
}
async function onSave() {
  console.log('Save Item', toRaw(item.value))

  await itemsStore.add(item.value)
  if (wipStore.has(item.value.id)) await wipStore.finish(item.value.id)

  // do a history replace with item-edit and then use the browser history?
  await router.replace({ name: 'item-edit', params: { id: item.value.id }, query: route.query })

  if (returnLocation === undefined) {
    await router.push({ name: 'item-list', params: { id: item.value.id } })
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

      <v-text-field v-model="item.label" label="Label" required></v-text-field>
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
        <v-text-field
          v-model="part.type"
          label="Type"
          min-width="10rem"
          hide-details
        ></v-text-field>
        <v-text-field v-model="part.label" label="Label" hide-details min-width="10rem">
          <template v-slot:append>
            <v-btn flat icon="mdi-delete" @click="() => onRemovePart(i)"></v-btn>
          </template>
        </v-text-field>
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
            v-model="item.msrp_cost"
            :precision="2"
            :min="0.0"
            label="Cost"
          ></v-number-input>
        </v-col>
        <v-col sm="6" cols="12" :class="{ ['pb-0']: smAndDown, ['pt-0']: xs }">
          <v-select
            v-model="item.msrp_cost_unit"
            :items="costUnits"
            item-value="id"
            item-title="title"
            label="Currency"
          ></v-select>
        </v-col>
      </v-row>
    </fieldset>

    <fieldset class="pa-3 my-2" v-if="settings.editorShowInternalID">
      <legend>Internals</legend>
      <v-text-field
        v-if="settings.editorShowInternalID"
        v-model="item.id"
        readonly
        label="Internal Item ID"
      ></v-text-field>
    </fieldset>

    <v-btn color="primary" text="Save" @click="onSave"></v-btn>
  </v-form>
</template>

<style lang="css" scoped>
fieldset > legend {
  padding-inline: 0.3rem;
}
</style>
