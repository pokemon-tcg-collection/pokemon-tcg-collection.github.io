import { acceptHMRUpdate, defineStore } from 'pinia'
import { readonly, ref, shallowRef, toRaw, triggerRef } from 'vue'

import usePokemonTCGCollectionIDB from '@/composables/usePokemonTCGCollectionIDB'
import type { Transaction } from '@/model/interfaces'
import { toRawDeep } from '@/utils/reactivity'

export const useTransactionsStore = defineStore('transactions', () => {
  const {
    put: idbPut,
    getAll: idbGetAll,
    delete: idbDelete,
  } = usePokemonTCGCollectionIDB('transactions')

  // -----------------------------------------------------------------------
  // state

  const transactions = shallowRef<Map<string, Transaction>>(new Map())

  // TODO: lookup by date/type?

  // -----------------------------------------------------------------------
  // actions

  async function add(
    transaction: Transaction,
    { overwrite = true }: { overwrite?: boolean } = {},
  ): Promise<boolean> {
    if (!overwrite && has(transaction)) {
      console.debug('Transaction with ID exists already!', transaction.id, transaction)
      return false
    }

    const copy = structuredClone(toRawDeep(transaction))
    transactions.value.set(transaction.id, copy)
    await idbPut(copy)

    return true
  }

  function get(id: string): Transaction | undefined {
    return structuredClone(toRaw(transactions.value.get(id)))
  }

  function has(idOrTransaction: Transaction | string): boolean {
    if (idOrTransaction === undefined) return false
    const id = typeof idOrTransaction === 'string' ? idOrTransaction : idOrTransaction.id
    return transactions.value.has(id)
  }

  async function remove(idOrTransaction: Transaction | string) {
    if (idOrTransaction === undefined) return false
    const id = typeof idOrTransaction === 'string' ? idOrTransaction : idOrTransaction.id
    const removed = transactions.value.delete(id)
    if (removed) await idbDelete(id)
    return removed
  }

  // -----------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(transactions.value.values()).map((transaction) => toRaw(transaction))
    return JSON.stringify(data)
  }

  function _deserialize(
    data: string,
    {
      clearBefore = false,
      overwriteExisting = false,
    }: { clearBefore?: boolean; overwriteExisting?: boolean } = {},
  ) {
    let dataDeser: Transaction[] | undefined = undefined
    try {
      dataDeser = JSON.parse(data) satisfies Transaction[]
    } catch (err) {
      console.error('Unable to deserialize data', err)
      return false
    }

    if (!dataDeser || !Array.isArray(dataDeser)) return false

    if (clearBefore) _reset()

    dataDeser.forEach((entry) => add(entry, { overwrite: overwriteExisting }))

    // trigger a refresh
    triggerRef(transactions)

    return true
  }

  function _reset() {
    transactions.value = new Map()
  }

  // -----------------------------------------------------------------------

  const _isHydrating = ref<boolean>(false)
  const _isHydrated = ref<boolean>(false)

  async function _hydrate({
    clearBefore = false,
    overwriteExisting = false,
  }: { clearBefore?: boolean; overwriteExisting?: boolean } = {}) {
    if (_isHydrating.value) return
    _isHydrating.value = true

    if (clearBefore) _reset()

    const values = await idbGetAll()
    if (!values) return

    values.forEach((entry) => {
      if (!overwriteExisting && has(entry)) return
      transactions.value.set(entry.id, entry)
    })

    _isHydrated.value = true
    _isHydrating.value = false
  }

  // -----------------------------------------------------------------------

  return {
    // state
    transactions,
    // actions
    add,
    get,
    has,
    remove,
    // internals
    $serialize: _serialize,
    $deserialize: _deserialize,
    $reset: _reset,
    $hydrate: _hydrate,
    $isHydrated: readonly(_isHydrated),
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTransactionsStore, import.meta.hot))
}
