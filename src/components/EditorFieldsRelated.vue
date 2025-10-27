<script setup lang="ts">
import { computed } from 'vue'

import EditorFieldset from '@/components/EditorFieldset.vue'
import type { Base, Card, Item, Transaction } from '@/model/interfaces'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useSettingsStore } from '@/stores/settings'
import { useTransactionsStore } from '@/stores/transactions'

// TODO: + attachment, + image
export type ObjectType = 'card' | 'item' | 'place' | 'transaction'
type RelatedIDs = {
  id: string
  type: ObjectType
  name: string | undefined
  direction: 'incoming' | 'outgoing'
  outgoingTargetExists?: boolean
}

const props = defineProps<{
  object: Base
  objectType: ObjectType
  direction?: 'incoming' | 'outgoing' | 'both'
}>()
const emit = defineEmits<{ edit: [id: string, type: string] }>()

const settings = useSettingsStore()
const cardsStore = useCardsStore()
const itemsStore = useItemsStore()
const placesStore = usePlacesStore()
const transactionsStore = useTransactionsStore()

function gatherRelations(
  object: Base,
  objectType: 'item' | 'transaction' | 'place' | 'card',
  direction: 'incoming' | 'outgoing' | 'both' | undefined,
  checkOutgoingTargetExists: boolean = false,
) {
  const objectId = object.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  if (direction === 'incoming' || direction === 'both' || direction === undefined) {
    if (objectType === 'item') {
      // item --> n items
      Array.from(itemsStore.items.values())
        .filter(
          (item) =>
            item.id !== objectId &&
            item.contents?.some((contentItem) => contentItem.item_id === objectId),
        )
        .forEach((item) =>
          related.push({ id: item.id, name: item.name, type: 'item', direction: 'incoming' }),
        )

      // transaction --> n items
      Array.from(transactionsStore.transactions.values())
        .filter((transaction) =>
          transaction.items?.some((transactionItem) => transactionItem.item_id === objectId),
        )
        .forEach((transaction) =>
          related.push({
            id: transaction.id,
            name: transaction.name,
            type: 'transaction',
            direction: 'incoming',
          }),
        )

      // card --> n items
      Array.from(cardsStore.cards.values())
        .filter((card) => card.item_ids?.includes(objectId))
        .forEach((card) =>
          related.push({ id: card.id, name: card.name, type: 'card', direction: 'incoming' }),
        )
    } else if (objectType === 'place') {
      // transaction --> 1 place

      Array.from(transactionsStore.transactions.values())
        .filter((transaction) => transaction.place_id === objectId)
        .forEach((transaction) =>
          related.push({
            id: transaction.id,
            name: transaction.name,
            type: 'transaction',
            direction: 'incoming',
          }),
        )
    } else if (objectType === 'transaction') {
      // card --> n transactions
      Array.from(cardsStore.cards.values())
        .filter((card) => card.transaction_ids?.includes(objectId))
        .forEach((card) =>
          related.push({ id: card.id, name: card.name, type: 'card', direction: 'incoming' }),
        )
    } else if (objectType === 'card') {
      // ? --> ? card(s)
    }
  }

  if (direction === 'outgoing' || direction === 'both') {
    if (objectType === 'item') {
      const item = object as Item

      // item --> n items
      item.contents?.forEach((itemContent) => {
        if (!itemContent.item_id) return
        const relItem = itemsStore.get(itemContent.item_id)
        if (!relItem) {
          if (checkOutgoingTargetExists) {
            related.push({
              id: itemContent.item_id,
              name: undefined,
              type: 'item',
              direction: 'outgoing',
              outgoingTargetExists: false,
            })
          }
          return
        }
        related.push({ id: relItem.id, name: relItem.name, type: 'item', direction: 'outgoing' })
      })
    } else if (objectType === 'place') {
      // place --> ? ?
    } else if (objectType === 'transaction') {
      const transaction = object as Transaction

      // transaction --> 1 place
      if (transaction.place_id) {
        const place = placesStore.get(transaction.place_id)
        if (place) {
          related.push({ id: place.id, name: place.name, type: 'place', direction: 'outgoing' })
        } else {
          if (checkOutgoingTargetExists) {
            related.push({
              id: transaction.place_id,
              name: undefined,
              type: 'place',
              direction: 'outgoing',
              outgoingTargetExists: false,
            })
          }
        }
      }

      // transaction --> n items
      transaction.items?.forEach((transactionItem) => {
        const item = itemsStore.get(transactionItem.item_id)
        if (!item) {
          if (checkOutgoingTargetExists) {
            related.push({
              id: transactionItem.item_id,
              name: undefined,
              type: 'item',
              direction: 'outgoing',
              outgoingTargetExists: false,
            })
          }
          return
        }
        related.push({ id: item.id, name: item.name, type: 'item', direction: 'outgoing' })
      })
    } else if (objectType === 'card') {
      const card = object as Card

      // card --> n items
      card.item_ids?.forEach((id) => {
        const item = itemsStore.get(id)
        if (!item) {
          if (checkOutgoingTargetExists) {
            related.push({
              id: id,
              name: undefined,
              type: 'item',
              direction: 'outgoing',
              outgoingTargetExists: false,
            })
          }
          return
        }
        related.push({ id: item.id, name: item.name, type: 'item', direction: 'outgoing' })
      })

      // card --> n transactions
      card.transaction_ids?.forEach((id) => {
        const transaction = transactionsStore.get(id)
        if (!transaction) {
          if (checkOutgoingTargetExists) {
            related.push({
              id: id,
              name: undefined,
              type: 'transaction',
              direction: 'outgoing',
              outgoingTargetExists: false,
            })
          }
          return
        }
        related.push({
          id: transaction.id,
          name: transaction.name,
          type: 'transaction',
          direction: 'outgoing',
        })
      })
    }
  }

  return related
}

function formatSubtitle(related: RelatedIDs): string {
  return [
    related.type,
    settings.editorShowInternalID ? `${related.id}` : undefined,
    related.direction,
    related.outgoingTargetExists === false ? 'invalid!' : undefined,
  ]
    .filter(Boolean)
    .join(' - ')
}
function formatColor(related: RelatedIDs): string | undefined {
  return related.outgoingTargetExists === false ? 'error' : undefined
}

const related_ids = computed<RelatedIDs[]>(() =>
  gatherRelations(props.object, props.objectType, props.direction, true),
)

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
        :title="related.name"
        :subtitle="formatSubtitle(related)"
        :base-color="formatColor(related)"
        link
      >
        <template v-slot:prepend>
          <v-icon
            :color="formatColor(related)"
            :icon="
              related.direction === 'incoming' ? 'mdi-arrow-bottom-right' : 'mdi-arrow-top-right'
            "
          ></v-icon>
        </template>
        <template v-slot:append>
          <v-btn flat @click="() => onEdit(related.id, related.type)" prepend-icon="mdi-file-edit"
            >Edit</v-btn
          >
        </template>
      </v-list-item>
    </v-list>
  </EditorFieldset>
</template>
