// Utilities
import type { PiniaPluginContext } from 'pinia'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import preloadData from './preloadData'

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
        language: 'en',
        name: 'Dark Charizard',
        number: '4',
        set: 'base5',
        amount: 5,
        tcgdex_id: 'base5-4',
      })
      store.add({
        id: 'f12475de-024c-457a-9d3d-dee8c86f4468',
        language: 'de',
        name: 'Pikachu',
        number: '11 12',
        set: '',
        amount: 2,
      })
    } else if (store.$id === 'transactions') {
      store.add({
        id: '123',
        type: 'purchase',
        cost: 100,
        cost_unit: 'EUR',
        cost_type: 'buy',
      })
      store.add({
        id: '456',
        name: 'Sold my best holo :-(',
        type: 'sale',
        cost: 400,
        cost_unit: 'EUR',
        cost_type: 'sell',
      })
      store.add({
        id: '789',
        name: 'Happi happi happi ...',
        type: 'gift',
        cost: 0,
        cost_unit: 'EUR',
        date: new Date(),
      })
    }
  })
}

export default pinia
