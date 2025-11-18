import type { DBSchema, IDBPDatabase, IDBPTransaction, StoreNames, StoreValue } from 'idb'

import type { Card, Item, Place, Transaction } from '@/model/interfaces'
import type { AuditMessage } from '@/stores/auditLog'
import type { TemplateObject } from '@/stores/templates'
import type { WIPObject } from '@/stores/workInProgress'
import useIndexedDB from './useIndexedDB'

export interface PokemonTCGCollectionDB extends DBSchema {
  transactions: {
    key: string
    value: Transaction

    // indexes: { 'cost_type': TransactionCostType }
  }
  cards: {
    key: string
    value: Card
  }
  places: {
    key: string
    value: Place
  }
  items: {
    key: string
    value: Item
  }
  auditLog: {
    key: string
    value: AuditMessage
  }
  workInProgress: {
    key: string
    value: WIPObject
  }
  templates: {
    key: string
    value: TemplateObject
  }
}

function upgrade(
  database: IDBPDatabase<PokemonTCGCollectionDB>,
  oldVersion: number,
  newVersion: number | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _transaction: IDBPTransaction<
    PokemonTCGCollectionDB,
    StoreNames<PokemonTCGCollectionDB>[],
    'versionchange'
  >,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _event: IDBVersionChangeEvent,
): void {
  console.log(`Updating IndexedDB schema from '${oldVersion}' to '${newVersion}'`)

  if (!database.objectStoreNames.contains('cards')) {
    database.createObjectStore('cards', { keyPath: 'id' })
  }
  if (!database.objectStoreNames.contains('transactions')) {
    database.createObjectStore('transactions', { keyPath: 'id' })
  }
  if (!database.objectStoreNames.contains('places')) {
    database.createObjectStore('places', { keyPath: 'id' })
  }
  if (!database.objectStoreNames.contains('items')) {
    database.createObjectStore('items', { keyPath: 'id' })
  }
  if (!database.objectStoreNames.contains('workInProgress')) {
    database.createObjectStore('workInProgress', { keyPath: 'id' })
  }
  if (!database.objectStoreNames.contains('auditLog')) {
    database.createObjectStore('auditLog', { keyPath: 'id' })
  }

  if (!database.objectStoreNames.contains('templates')) {
    database.createObjectStore('templates', { keyPath: 'type' })
  }
}

export default function usePokemonTCGCollectionIDB<
  StoreName extends StoreNames<PokemonTCGCollectionDB>,
  StoreKey extends IDBKeyRange | PokemonTCGCollectionDB[StoreName]['key'],
>(store: StoreName) {
  const { getDB } = useIndexedDB<PokemonTCGCollectionDB>('pokemon-tcg-collection', 2, { upgrade })

  async function put(value: StoreValue<PokemonTCGCollectionDB, StoreName>) {
    const dbHdl = await getDB()
    const tx = dbHdl.transaction(store, 'readwrite')
    await tx.store.put(value)
    tx.commit()
  }

  async function putWithKey(key: StoreKey, value: StoreValue<PokemonTCGCollectionDB, StoreName>) {
    const dbHdl = await getDB()
    const tx = dbHdl.transaction(store, 'readwrite')
    await tx.store.put(value, key)
    tx.commit()
  }

  async function get(
    key: StoreKey,
  ): Promise<StoreValue<PokemonTCGCollectionDB, StoreName> | undefined> {
    const dbHdl = await getDB()
    const tx = dbHdl.transaction(store, 'readonly')
    const value = await tx.store.get(key)
    return value
  }

  async function getAll(): Promise<StoreValue<PokemonTCGCollectionDB, StoreName>[] | undefined> {
    const dbHdl = await getDB()
    const tx = dbHdl.transaction(store, 'readonly')
    const values = await tx.store.getAll()
    // console.debug(`values from '${store}' store`, values)
    return values
  }

  async function _delete(key: StoreKey) {
    const dbHdl = await getDB()
    const tx = dbHdl.transaction(store, 'readwrite')
    await tx.store.delete(key)
    tx.commit()
  }

  async function clear() {
    const dbHdl = await getDB()
    const tx = dbHdl.transaction(store, 'readwrite')
    await tx.store.clear()
    tx.commit()
  }

  return { put, putWithKey, get, getAll, delete: _delete, clear }
}
