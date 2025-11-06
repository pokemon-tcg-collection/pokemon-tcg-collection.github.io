<script setup lang="ts">
import { computed, readonly, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

import EditorBase from '@/components/EditorBase.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import useEditorObject from '@/composables/useEditorObject'
import type { Item, ItemPart } from '@/model/interfaces'
import { CARD_LANGUAGES, COST_UNITS, ITEM_TYPES } from '@/model/interfaces'
import type { EditRouteNames } from '@/router/routes'
import { useItemsStore } from '@/stores/items'

const { smAndDown, xs } = useDisplay()

const itemsStore = useItemsStore()

const router = useRouter()

const {
  object: item,
  objectSource: itemSource,
  objectChanged: itemChanged,
  existsInStore,
  objectIdFromParam: itemIdFromParam,
  returnLocation,
  saveAsDraft: saveItemAsDraft,
  save: saveItem,
  delete: deleteItem,
  discardChanges,
  navigateTo,
} = useEditorObject('item')

const itemTypes = readonly(ITEM_TYPES)
const costUnits = readonly(COST_UNITS)

const item_ids = computed<{ id: string; label: string; item: Item }[]>(() =>
  Array.from(itemsStore.items.values())
    // NOTE: remove self from list
    // TODO: remove reference loops?
    .filter((item2) => item2.id !== (item.value?.id ?? itemIdFromParam.value))
    .map((item) => ({ id: item.id, label: item.name, item })),
)

function onAddOneMorePart() {
  if (!item.value) return
  if (item.value.contents === undefined) item.value.contents = []
  item.value.contents.push({
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

  await saveItemAsDraft()
  // 'item-new' only works if we set a :key on <router-view> to force rerendering
  await navigateTo('item-new')
}
function onItemPartItemSelected(part: ItemPart) {
  if (part.item_id !== undefined) {
    const partItem = itemsStore.get(part.item_id)
    if (partItem !== undefined) {
      if (!part.name || part.name.trim().length === 0) {
        part.name = partItem.name
      }
      if (!part.type || part.type.trim().length === 0) {
        if (partItem.type !== undefined) {
          part.type = partItem.type
        }
      }
    }
  }
}

async function onRelationEdit(id: string, type: string) {
  if (!item.value) return

  await saveItemAsDraft()
  await navigateTo(`${type}-edit` as EditRouteNames, { id })
}

async function onSave() {
  if (!item.value) return
  console.log('Save Item', toRaw(item.value))

  await saveItem()

  if (returnLocation.value === undefined) {
    await router.push({ name: 'item-list' })
  } else {
    await router.push(returnLocation.value)
  }
}
async function onDelete() {
  if (!item.value) return
  console.log('Delete Item', toRaw(item.value))

  await deleteItem()

  if (returnLocation.value === undefined) {
    await router.push({ name: 'item-list' })
  } else {
    await router.push(returnLocation.value)
  }
}
async function onLeave(type: 'save' | 'save-draft' | 'discard-changes') {
  if (type === 'save') {
    await saveItem()
  } else if (type === 'save-draft') {
    await saveItemAsDraft()
  } else if (type === 'discard-changes') {
    discardChanges()
  }
}
</script>

<template>
  <EditorBase
    v-model="item"
    object-type="item"
    :object-changed="itemChanged"
    :exists-in-store="existsInStore"
    :is-draft="itemSource === 'wip'"
    title="Item Editor"
    @save="onSave"
    @delete="onDelete"
    @leave-action="onLeave"
    @relation-edit="onRelationEdit"
  >
    <template v-if="item">
      <EditorFieldset label="Details">
        <v-autocomplete
          v-model="item.language"
          :items="CARD_LANGUAGES"
          item-value="code"
          item-title="name"
          label="Language"
        ></v-autocomplete>

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
            <template #no-data>
              <v-list-item>
                <v-list-item-action @click="onAddNewItem">Create new Item</v-list-item-action>
              </v-list-item>
            </template>
            <template #append>
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
    </template>
  </EditorBase>
</template>
