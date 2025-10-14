// Utilities
import { createPinia } from 'pinia'
import type { PiniaPluginContext } from 'pinia'

const pinia = createPinia()

pinia.use((context: PiniaPluginContext) => {
  console.log('pinia plugin', context)
})

export default pinia
