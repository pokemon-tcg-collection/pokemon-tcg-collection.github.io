import { openDB, deleteDB, wrap, unwrap } from 'idb'
import type { DBSchema, IDBPDatabase, IDBPTransaction, StoreNames } from 'idb'
import { ref } from 'vue'

export default function useIndexedDB<DB extends DBSchema>(
  name: string,
  version: number,
  {
    upgrade: upgradeParam,
  }: {
    upgrade?: (
      database: IDBPDatabase<DB>,
      oldVersion: number,
      newVersion: number | null,
      transaction: IDBPTransaction<DB, StoreNames<DB>[], 'versionchange'>,
      event: IDBVersionChangeEvent,
    ) => void
  },
) {
  const db = ref<IDBPDatabase<DB>>()
  const error = ref<unknown>()

  async function _openDB() {
    if (db.value) {
      db.value.close()
      db.value = undefined
    }

    try {
      const openedDB = await openDB<DB>(name, version, {
        upgrade(db, oldVersion, newVersion, transaction, event) {
          console.debug('[idb][upgrade]', { db, oldVersion, newVersion, transaction, event })
          upgradeParam?.(db, oldVersion, newVersion, transaction, event)
        },

        blocked(currentVersion, blockedVersion, event) {
          console.debug('[idb][blocked]', { currentVersion, blockedVersion, event })
        },
        blocking(currentVersion, blockedVersion, event) {
          console.debug('[idb][blocking]', { currentVersion, blockedVersion, event })
        },
        terminated() {
          console.debug('[idb][terminated]')
          db.value = undefined
        },
      })

      db.value = openedDB

      return openedDB
    } catch (err) {
      console.error('Unable to open IndexedDB', err)
      error.value = err
    }
    return undefined
  }

  async function _getDB(): Promise<IDBPDatabase<DB>> {
    if (db.value) return db.value
    const dbHdl = await _openDB()
    if (!dbHdl) throw new Error('Unable to open IndexedDB')
    return dbHdl
  }

  _openDB().catch((reason) => {
    console.error('Unable to open IndexedDB (initial)', reason)
  })

  return { db, error, getDB: _getDB, openDB: _openDB }
}
