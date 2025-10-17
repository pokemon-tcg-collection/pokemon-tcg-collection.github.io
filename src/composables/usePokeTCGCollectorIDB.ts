import type { DBSchema, IDBPDatabase, IDBPTransaction, StoreNames, StoreValue } from 'idb'

import type { Card, Item, Place, Transaction } from '@/model/interfaces'
import type { AuditMessage } from '@/stores/auditLog'
import type { WIPObject } from '@/stores/workInProgress'
import useIndexedDB from './useIndexedDB'

export interface PokeTCGCollectorDB extends DBSchema {
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
}

function upgrade(
  database: IDBPDatabase<PokeTCGCollectorDB>,
  oldVersion: number,
  newVersion: number | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _transaction: IDBPTransaction<
    PokeTCGCollectorDB,
    StoreNames<PokeTCGCollectorDB>[],
    'versionchange'
  >,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _event: IDBVersionChangeEvent,
): void {
  console.log(`Updating IndexedDB schema from '${oldVersion}' to '${newVersion}'`)

  database.createObjectStore('cards', { keyPath: 'id' })
  database.createObjectStore('transactions', { keyPath: 'id' })
  database.createObjectStore('places', { keyPath: 'id' })
  database.createObjectStore('items', { keyPath: 'id' })
  database.createObjectStore('workInProgress', { keyPath: 'id' })
  database.createObjectStore('auditLog', { keyPath: 'id' })
}

export default function usePokeTCGCollectorIDB<
  StoreName extends StoreNames<PokeTCGCollectorDB>,
  StoreKey extends IDBKeyRange | PokeTCGCollectorDB[StoreName]['key'],
>(store: StoreName) {
  const { getDB } = useIndexedDB<PokeTCGCollectorDB>('poketcgcollector', 1, { upgrade })

  async function put(value: StoreValue<PokeTCGCollectorDB, StoreName>) {
    const dbHdl = await getDB()
    const tx = dbHdl.transaction(store, 'readwrite')
    await tx.store.put(value)
    tx.commit()
  }

  async function putWithKey(key: StoreKey, value: StoreValue<PokeTCGCollectorDB, StoreName>) {
    const dbHdl = await getDB()
    const tx = dbHdl.transaction(store, 'readwrite')
    await tx.store.put(value, key)
    tx.commit()
  }

  async function get(
    key: StoreKey,
  ): Promise<StoreValue<PokeTCGCollectorDB, StoreName> | undefined> {
    const dbHdl = await getDB()
    const tx = dbHdl.transaction(store, 'readonly')
    const value = await tx.store.get(key)
    return value
  }

  async function getAll(): Promise<StoreValue<PokeTCGCollectorDB, StoreName>[] | undefined> {
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
