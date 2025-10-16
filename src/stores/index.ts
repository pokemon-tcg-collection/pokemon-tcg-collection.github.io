// Utilities
import type { PiniaPluginContext } from 'pinia'
import { createPinia } from 'pinia'

const pinia = createPinia()

pinia.use((context: PiniaPluginContext) => {
  console.debug('pinia plugin', context.store.$id, context)

  // TODO: do hydration
})

export default pinia
