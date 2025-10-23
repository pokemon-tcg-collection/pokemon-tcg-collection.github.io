// Utilities
import type { PiniaPluginContext } from 'pinia'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import preloadData from './preloadData'
import type { Card, Transaction } from '@/model/interfaces'

const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

// hydration: load data from IndexedDB
pinia.use((context: PiniaPluginContext) => {
  // console.debug('pinia IndexedDB hydration plugin', context.store.$id, context)
  const store = context.store

  if (Object.hasOwn(store, '$hydrate')) {
    console.log(`🍍 Hydrating "${store.$id}" store ...`)
    store.$hydrate({ clearBefore: false, overwriteExisting: false })
  }
})

pinia.use((context: PiniaPluginContext) => {
  // console.debug('pinia preload data plugin', context.store.$id, context)
  const store = context.store
  const name = store.$id

  if (Object.hasOwn(preloadData, name)) {
    const data = (preloadData as unknown as { [key: string]: [] })[name]
    if (!data || !Array.isArray(data) || data.length === 0) return

    console.log(`🍍 Preloading data for "${store.$id}" store (${data.length} entries) ...`)
    for (const entry of data) {
      store.add(entry)
    }
  }
})

if (import.meta.env.DEV) {
  console.warn('Injecting testing data ...')

  pinia.use((context: PiniaPluginContext) => {
    const store = context.store

    if (store.$id === 'cards') {
      store.add({
        id: 'd68d1ba7-52e9-4c3b-a134-787f40f8823d',
        name: 'Dark Charizard',
        language: 'en',
        number: '4',
        set: 'base5',
        amount: 5,
        tcgdex_id: 'base5-4',
        _meta: { created: new Date() },
      } satisfies Card)
      store.add({
        id: 'f12475de-024c-457a-9d3d-dee8c86f4468',
        name: 'Pikachu',
        language: 'de',
        number: '11 12',
        set: '',
        amount: 2,
        _meta: { created: new Date() },
      } satisfies Card)
    } else if (store.$id === 'transactions') {
      store.add({
        id: '123',
        type: 'buy',
        cost: 100,
        cost_unit: 'EUR',
        items: [],
        name: '',
        _meta: { created: new Date() },
      } satisfies Transaction)
      store.add({
        id: '456',
        name: 'Sold my best holo :-(',
        type: 'sell',
        cost: 400,
        cost_unit: 'EUR',
        items: [],
        _meta: { created: new Date() },
      } satisfies Transaction)
      store.add({
        id: '789',
        name: 'Happi happi happi ...',
        type: 'gift-receive',
        cost: 0,
        cost_unit: 'EUR',
        date: new Date(),
        items: [],
        _meta: { created: new Date() },
      } satisfies Transaction)
    }
  })
}

export default pinia
