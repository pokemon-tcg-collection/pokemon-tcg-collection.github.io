<script setup lang="ts">
import { computed } from 'vue'

import EditorFieldset from '@/components/EditorFieldset.vue'
import type { Base } from '@/model/interfaces'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { useTransactionsStore } from '@/stores/transactions'

// TODO: + attachment, + image
export type ObjectType = 'card' | 'item' | 'place' | 'transaction'
type RelatedIDs = { id: string; type: ObjectType; name: string }

const props = defineProps<{
  object: Base
  objectType: ObjectType
}>()
const emit = defineEmits<{ edit: [id: string, type: string] }>()

const cardsStore = useCardsStore()
const itemsStore = useItemsStore()
const transactionsStore = useTransactionsStore()

const related_ids = computed<RelatedIDs[]>(() => {
  const objectId = props.object?.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  if (props.objectType === 'item') {
    // item --> n items
    Array.from(itemsStore.items.values())
      .filter(
        (item) =>
          item.id !== objectId &&
          item.contents?.some((contentItem) => contentItem.item_id === objectId),
      )
      .forEach((item) => related.push({ id: item.id, name: item.name, type: 'item' }))

    // transaction --> n items
    Array.from(transactionsStore.transactions.values())
      .filter((transaction) =>
        transaction.items?.some((transactionItem) => transactionItem.item_id === objectId),
      )
      .forEach((transaction) =>
        related.push({ id: transaction.id, name: transaction.name, type: 'transaction' }),
      )

    // card --> n items
    Array.from(cardsStore.cards.values())
      .filter((card) => card.item_ids?.includes(objectId))
      .forEach((card) => related.push({ id: card.id, name: card.name, type: 'card' }))
  } else if (props.objectType === 'place') {
    // transaction --> 1 place
    Array.from(transactionsStore.transactions.values())
      .filter((transaction) => transaction.place_id === objectId)
      .forEach((transaction) =>
        related.push({ id: transaction.id, name: transaction.name, type: 'transaction' }),
      )
  } else if (props.objectType === 'transaction') {
    // card --> n transactions
    Array.from(cardsStore.cards.values())
      .filter((card) => card.transaction_ids?.includes(objectId))
      .forEach((card) => related.push({ id: card.id, name: card.name, type: 'card' }))
  } else if (props.objectType === 'card') {
    // ? --> ? card(s)
  }

  return related
})

function onEdit(id: string, type: string) {
  // :to="{ name: `${related.type}-edit`, params: { id: related.id } }"
  // TODO: better with handler to save state (WIP) if dirty and return query

  emit('edit', id, type)
}
</script>

<template>
  <EditorFieldset v-if="related_ids.length > 0" label="Relations">
    <v-list class="pt-0">
      <v-list-item
        v-for="related of related_ids"
        :key="related.id"
        :value="related.id"
        :title="related.name"
        :subtitle="`${related.type} - ${related.id}`"
      >
        <template v-slot:append>
          <v-btn flat @click="() => onEdit(related.id, related.type)" prepend-icon="mdi-file-edit"
            >Edit</v-btn
          >
        </template>
      </v-list-item>
    </v-list>
  </EditorFieldset>
</template>
