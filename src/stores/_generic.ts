import type { defineStore } from 'pinia'

import type { Card, Item, Place, Set, Transaction } from '@/model/interfaces'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useSetsStore } from '@/stores/sets'
import { useTransactionsStore } from '@/stores/transactions'

// -------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PiniaStore<T extends (...args: any) => any> = Omit<
  ReturnType<T>,
  keyof ReturnType<typeof defineStore>
>

// -------------------------------------------------------------------------

// see: https://github.com/vuejs/pinia/discussions/1054#discussioncomment-2172110
export type UseNullStore = ReturnType<typeof defineStore>
export type NullStore = ReturnType<UseNullStore>
export type ItemsStore = ReturnType<typeof useItemsStore>
export type ItemsStoreSGA = Omit<ItemsStore, keyof NullStore>
export type TransactionsStore = ReturnType<typeof useTransactionsStore>
export type TransactionsStoreSGA = Omit<TransactionsStore, keyof NullStore>
export type PlacesStore = ReturnType<typeof usePlacesStore>
export type PlacesStoreSGA = Omit<PlacesStore, keyof NullStore>
export type CardsStore = ReturnType<typeof useCardsStore>
export type CardsStoreSGA = Omit<CardsStore, keyof NullStore>
export type SetsStore = ReturnType<typeof useSetsStore>
export type SetsStoreSGA = Omit<SetsStore, keyof NullStore>

export interface TypeMap {
  item: {
    object: Item
    store: ItemsStoreSGA
  }
  transaction: {
    object: Transaction
    store: TransactionsStoreSGA
  }
  place: {
    object: Place
    store: PlacesStoreSGA
  }
  card: {
    object: Card
    store: CardsStoreSGA
  }
  set: {
    object: Set
    store: SetsStoreSGA
  }
}

// -------------------------------------------------------------------------

function getStore(type: 'item'): ItemsStoreSGA
function getStore(type: 'transaction'): TransactionsStoreSGA
function getStore(type: 'place'): PlacesStoreSGA
function getStore(type: 'card'): CardsStoreSGA
function getStore(type: 'set'): SetsStoreSGA
function getStore<TN extends keyof TypeMap>(type: TN) {
  if (type === 'item') return useItemsStore() as ItemsStoreSGA
  if (type === 'transaction') return useTransactionsStore() as TransactionsStoreSGA
  if (type === 'place') return usePlacesStore() as PlacesStoreSGA
  if (type === 'card') return useCardsStore() as CardsStoreSGA
  if (type === 'set') return useSetsStore() as SetsStoreSGA
  return undefined
}

export { getStore }

// -------------------------------------------------------------------------
