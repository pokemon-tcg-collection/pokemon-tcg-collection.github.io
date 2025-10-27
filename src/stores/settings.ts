import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    // -----------------------------------------------------------------------
    // state

    const editorShowInternalID = ref(true)
    const editorShowObjectInternals = ref(true)
    const editorShowObjectRelations = ref(true)

    // -----------------------------------------------------------------------
    // actions

    // -----------------------------------------------------------------------

    function _reset() {
      editorShowInternalID.value = true
    }

    // -----------------------------------------------------------------------

    return {
      // state
      editorShowInternalID,
      editorShowObjectInternals,
      editorShowObjectRelations,
      // actions
      // internals
      $reset: _reset,
    }
  },
  {
    // pinia-plugin-persistedstate
    persist: true,
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
