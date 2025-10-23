<script setup lang="ts">
const dialog = defineModel<boolean>({ required: true })

const { isDraft, closeOnClick } = defineProps({
  isDraft: {
    type: Boolean,
    required: false,
    default: false,
  },
  closeOnClick: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const emit = defineEmits<{
  save: []
  saveDraft: []
  discard: []
}>()

function onUserChoiceSave() {
  emit('save')
  if (closeOnClick) dialog.value = false
}
function onUserChoiceSaveDraft() {
  emit('saveDraft')
  console.log('closeOnClick', closeOnClick)
  if (closeOnClick) dialog.value = false
}
function onUserChoiceDiscardChanges() {
  emit('discard')
  if (closeOnClick) dialog.value = false
}
</script>

<template>
  <v-dialog v-model="dialog" width="auto" persistent>
    <v-card
      prepend-icon="mdi-content-save-alert"
      title="Unsaved changes"
      text="Some inputs have changed. Please save or discard before continuing."
      class="pa-2"
    >
      <template v-slot:actions>
        <v-btn @click="onUserChoiceSave" variant="tonal" color="primary">{{
          isDraft ? 'Save and finish Draft' : 'Save'
        }}</v-btn>
        <v-btn @click="onUserChoiceSaveDraft" variant="tonal">{{
          isDraft ? 'Update Draft' : 'Save as Draft'
        }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="onUserChoiceDiscardChanges" variant="tonal" color="warning"
          >Discard Changes</v-btn
        >
      </template>
    </v-card>
  </v-dialog>
</template>
