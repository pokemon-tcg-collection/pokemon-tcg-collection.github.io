<script setup lang="ts">
import { computed } from 'vue'

import EditorFieldset from '@/components/EditorFieldset.vue'
import type { Base, RelatedURL } from '@/model/interfaces'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useSetsStore } from '@/stores/sets'
import { useTransactionsStore } from '@/stores/transactions'

export type ObjectType = 'card' | 'set' | 'item' | 'place' | 'transaction'

const object = defineModel<Base>({ required: true })
const { objectType } = defineProps<{
  objectType: ObjectType
}>()

const relatedURLNames = computed(() => {
  let objects: unknown[] | undefined = undefined

  if (objectType === 'card') {
    objects = Array.from(useCardsStore().cards.values())
  } else if (objectType === 'set') {
    objects = Array.from(useSetsStore().sets.values())
  } else if (objectType === 'item') {
    objects = Array.from(useItemsStore().items.values())
  } else if (objectType === 'place') {
    objects = Array.from(usePlacesStore().places.values())
  } else if (objectType === 'transaction') {
    objects = Array.from(useTransactionsStore().transactions.values())
  } else {
    return []
  }

  const names = Array.from((objects as Base[]).values())
    .map((object) => object.related_urls ?? [])
    .flat(1)
    .reduce((set, cur) => set.add(cur.name), new Set<string>())

  return Array.from(names.values()).sort()
})

function onAddNewRelatedURL() {
  if (object.value.related_urls === undefined) object.value.related_urls = []

  object.value.related_urls.push({
    url: '',
    name: '',
  } satisfies RelatedURL)
}
function onRemoveURL(url_idx: number) {
  object.value.related_urls =
    object.value.related_urls?.filter((_val, idx) => idx !== url_idx) ?? []
}
</script>

<template>
  <EditorFieldset label="Related URLs">
    <v-row
      class="gc-5 ms-0 me-0"
      :class="{ ['mt-0']: i === 0 }"
      v-for="(url, i) in object.related_urls"
      :key="i"
    >
      <v-combobox
        v-model="url.name"
        :items="relatedURLNames"
        min-width="10rem"
        width="max-content"
        label="Description"
        clearable
      ></v-combobox>
      <v-text-field v-model="url.url" min-width="15rem" width="max-content" label="URL">
        <template #append>
          <v-btn flat icon="mdi-delete" @click="() => onRemoveURL(i)"></v-btn>
        </template>
      </v-text-field>
    </v-row>

    <v-divider
      class="mt-2 mb-4"
      v-if="object.related_urls !== undefined && object.related_urls.length > 0"
    ></v-divider>

    <v-btn @click="onAddNewRelatedURL">Add more</v-btn>
  </EditorFieldset>
</template>
