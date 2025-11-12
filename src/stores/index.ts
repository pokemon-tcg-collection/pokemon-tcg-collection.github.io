// Utilities
import type { PiniaPluginContext } from 'pinia'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

// hydration: load data from IndexedDB
pinia.use((context: PiniaPluginContext) => {
  // console.debug('pinia IndexedDB hydration plugin', context.store.$id, context)
  const store = context.store

  if (Object.hasOwn(store, '$hydrate')) {
    console.log(`🍍 Hydrating "${store.$id}" store ...`)
    ;(async () => await store.$hydrate({ clearBefore: false, overwriteExisting: false }))()
  }
})

export default pinia
