import 'pinia'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    // hydration from external datasource
    // (a) pinia-pluginpersistedstate, https://codeberg.org/praz/pinia-plugin-persistedstate/src/branch/main/src/types.ts
    // (b) with IndexedDB
    $hydrate:
      | ((opts?: { runHooks?: boolean }) => void)
      | ((opts?: { clearBefore?: boolean; overwriteExisting?: boolean }) => Promise<void>)

    // export/import of stores to JSON
    $serialize: () => string
    $deserialize: (
      data: string,
      opts?: {
        clearBefore?: boolean
        overwriteExisting?: boolean
      },
    ) => boolean

    // resetting stores to default
    $reset: () => void
  }
}
