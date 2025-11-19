<script setup lang="ts">
import type { SupportedLanguages } from '@tcgdex/sdk'
import { computed } from 'vue'

import EditorFieldset from '@/components/EditorFieldset.vue'
import { CARD_LANGUAGES, TCGDEX_LANGUAGES } from '@/model/interfaces'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()

const languages = computed(() =>
  CARD_LANGUAGES.filter((language) =>
    TCGDEX_LANGUAGES.includes(language.code as unknown as SupportedLanguages),
  ),
)
</script>

<template>
  <h1 class="mb-3">TCGDex API</h1>

  <v-form>
    <EditorFieldset label="Settings">
      <v-autocomplete
        v-model="settings.tcgdexDefaultLanguage"
        :items="languages"
        item-value="code"
        item-title="name"
        label="Default language"
        hint="Default language selected in editor inputs / when using TCGdex API. User may be able to change this where required."
      ></v-autocomplete>

      <v-number-input
        v-model="settings.tcgdexRequestDelay"
        :min="0"
        :max="5000"
        :step="50"
        suffix="ms"
        prepend-inner-icon="mdi-timer-pause"
        label="Request delay to TCGdex API (in milliseconds)"
        hint="Applied for batches of requests to not overload the API endpoint."
      ></v-number-input>
    </EditorFieldset>
  </v-form>
</template>
