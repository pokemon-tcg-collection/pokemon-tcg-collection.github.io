<script setup lang="ts">
import { computed, ref } from 'vue'

import type { RefID, Item } from '@/model/interfaces'
import { ITEM_TYPES, CARD_LANGUAGES } from '@/model/interfaces'
import { useItemsStore } from '@/stores/items'
import { highlightAutocompleteItem, highlightAutocompleteItemValue } from '@/utils/autocomplete'

const model = defineModel<RefID | undefined>()
const search = ref<string>('')

const emit = defineEmits<{
  onNewItem: []
}>()

const itemsStore = useItemsStore()

interface ItemItem {
  id: string
  label: string
  language_label: string | undefined
  type_label: string | undefined
  item: Item
}
const itemItems = computed<ItemItem[]>(() =>
  Array.from(itemsStore.items.values()).map((item) => {
    const itemType = item.type
    const itemTypeLabel = ITEM_TYPES.find((it) => it.id == itemType)?.label

    const itemLanguageLabel = CARD_LANGUAGES.find((cl) => cl.code == item.language)?.short

    return {
      id: item.id,
      label: item.name,
      language_label: itemLanguageLabel,
      type_label: itemTypeLabel,
      item,
    }
  }),
)

function onNewItem() {
  emit('onNewItem')
}
</script>

<template>
  <v-autocomplete
    v-model="model"
    v-model:search="search"
    :items="itemItems"
    :filter-keys="['title', 'raw.language_label', 'raw.type_label']"
    item-title="label"
    item-value="id"
    clearable
    label="Items"
    hide-details
  >
    <template #item="{ props, internalItem, item }">
      <v-list-item v-bind="props">
        <template #title
          ><component :is="() => highlightAutocompleteItem(internalItem, search)"
        /></template>
        <template #subtitle
          ><template v-if="item.language_label"
            ><component :is="() => highlightAutocompleteItemValue(item.language_label, search)" />{{
              ' | '
            }}</template
          ><component :is="() => highlightAutocompleteItemValue(item.type_label, search)"
        /></template>
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item @click="onNewItem">Create new Item</v-list-item>
    </template>
    <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </v-autocomplete>
</template>
