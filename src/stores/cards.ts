import { acceptHMRUpdate, defineStore } from 'pinia'
import { readonly, ref, shallowRef, toRaw, triggerRef } from 'vue'

import usePokemonTCGCollectionIDB from '@/composables/usePokemonTCGCollectionIDB'
import type { Card } from '@/model/interfaces'
import { toRawDeep } from './utils'

export const useCardsStore = defineStore('cards', () => {
  const { put: idbPut, getAll: idbGetAll, delete: idbDelete } = usePokemonTCGCollectionIDB('cards')

  // -----------------------------------------------------------------------
  // state

  const cards = shallowRef<Map<string, Card>>(new Map())

  // -----------------------------------------------------------------------
  // actions

  async function add(
    card: Card,
    { overwrite = true }: { overwrite?: boolean } = {},
  ): Promise<boolean> {
    if (!overwrite && has(card)) {
      console.debug('Card with ID exists already!', card.id, card)
      return false
    }

    const copy = structuredClone(toRawDeep(card))
    cards.value.set(card.id, copy)
    await idbPut(copy)

    return true
  }

  function get(id: string): Card | undefined {
    return structuredClone(toRaw(cards.value.get(id)))
  }

  function has(idOrCard: Card | string): boolean {
    if (idOrCard === undefined) return false
    const id = typeof idOrCard === 'string' ? idOrCard : idOrCard.id
    return cards.value.has(id)
  }

  async function remove(idOrCard: Card | string) {
    if (idOrCard === undefined) return false
    const id = typeof idOrCard === 'string' ? idOrCard : idOrCard.id
    const removed = cards.value.delete(id)
    if (removed) await idbDelete(id)
    return removed
  }

  async function fetchInfo(idOrCard: Card | string) {
    if (idOrCard === undefined) return undefined
    const id = typeof idOrCard === 'string' ? idOrCard : idOrCard.id
    // TODO ...
    console.warn('[fetchInfo]', 'Not implemented', id)
  }

  // -----------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(cards.value.values()).map((card) => toRaw(card))
    return JSON.stringify(data)
  }

  function _deserialize(
    data: string,
    {
      clearBefore = false,
      overwriteExisting = false,
    }: { clearBefore?: boolean; overwriteExisting?: boolean } = {},
  ) {
    let dataDeser: Card[] | undefined = undefined
    try {
      dataDeser = JSON.parse(data) satisfies Card[]
    } catch (err) {
      console.error('Unable to deserialize data', err)
      return false
    }

    if (!dataDeser || !Array.isArray(dataDeser)) return false

    if (clearBefore) _reset()

    dataDeser.forEach((entry) => add(entry, { overwrite: overwriteExisting }))

    // trigger a refresh
    triggerRef(cards)

    return true
  }

  function _reset() {
    cards.value = new Map()
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
      cards.value.set(entry.id, entry)
    })

    _isHydrated.value = true
    _isHydrating.value = false
  }

  // -----------------------------------------------------------------------

  return {
    // state
    cards,
    // actions
    add,
    get,
    has,
    remove,
    fetchInfo,
    // internals
    $serialize: _serialize,
    $deserialize: _deserialize,
    $reset: _reset,
    $hydrate: _hydrate,
    $isHydrated: readonly(_isHydrated),
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCardsStore, import.meta.hot))
}
