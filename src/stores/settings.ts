import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // -----------------------------------------------------------------------
  // state

  const editorShowInternalID = ref(true)

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
    // actions
    // internals
    $reset: _reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
