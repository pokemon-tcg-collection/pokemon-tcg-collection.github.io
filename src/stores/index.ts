// Utilities
import type { PiniaPluginContext } from 'pinia'
import { createPinia } from 'pinia'

const pinia = createPinia()

pinia.use((context: PiniaPluginContext) => {
  console.debug('pinia plugin', context.store.$id, context)

  // TODO: do hydration
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
    } else if (store.$id === 'places') {
      store.add({
        id: '72864d29-48df-4004-b864-fa675ba92832',
        type: 'local',
        name: 'Gate to the Games',
        url: 'https://www.gate-to-the-games.de/',
        address:
          'Richard-Wagner-Straße 9\nObjekt am Hallischen Tor 1\nBrühl 33\n04109 Leipzig\n\nTelefon: 0341 / 91025937\nE-Mail: leipzig@gate-to-the-games.de',
      })
    }

    // TODO: do hydration
  })
}

export default pinia
