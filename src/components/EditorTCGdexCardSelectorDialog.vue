<script setup lang="ts">
import type { Card, SupportedLanguages } from '@tcgdex/sdk'
import { ref } from 'vue'

import EditorFieldsTCGdexCardSelector from '@/components/EditorFieldsTCGdexCardSelector.vue'

const emit = defineEmits<{
  cardSelected: [card: Card, language: SupportedLanguages, overwrite: boolean]
  abort: []
}>()

const dialog = defineModel<boolean>({ required: true })
const selectedCard = ref<Card | null>(null)
const selectedLanguage = ref<SupportedLanguages>()
const overwrite = ref<boolean>(false)

function onCardSelected(card: Card, language: SupportedLanguages) {
  selectedCard.value = card
  selectedLanguage.value = language
}

function onModelValueChange() {
  // detect ESC or outside click as abort
  // (mode-value change does not triggers when we set dialog.value?)
  emit('abort')
}
function onUserClose() {
  emit('abort')
  dialog.value = false
}
function onUserConfirm() {
  if (selectedCard.value !== null && selectedLanguage.value !== undefined) {
    emit('cardSelected', selectedCard.value, selectedLanguage.value, overwrite.value)
  }
  dialog.value = false
}
</script>

<template>
  <v-dialog v-model="dialog" @update:model-value="onModelValueChange" width="auto">
    <v-card prepend-avatar="/service-logos/tcgdex_logo.svg" title="TCGdex Card Selector">
      <template #prepend>
        <v-avatar rounded="0"></v-avatar>
      </template>
      <v-card-text>
        <v-form>
          <EditorFieldsTCGdexCardSelector
            @card-selected="onCardSelected"
          ></EditorFieldsTCGdexCardSelector>
        </v-form>
        <v-checkbox
          v-model="overwrite"
          label="Overwrite existing data?"
          persistent-hint
          hint="May overwrite card name, card number, card set, TCGdex card ID, and PokéAPI Pokémon National Dex ID. If not checked, will ignore non-empty fields."
        ></v-checkbox>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn text="Close" variant="plain" @click="onUserClose"></v-btn>
        <v-btn
          color="primary"
          text="Confirm"
          variant="tonal"
          @click="onUserConfirm"
          :disabled="selectedCard === null"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
