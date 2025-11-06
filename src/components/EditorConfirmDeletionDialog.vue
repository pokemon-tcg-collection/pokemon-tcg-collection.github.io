<script setup lang="ts">
const dialog = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  confirm: []
  abort: []
}>()

function onUserConfirm() {
  emit('confirm')
  dialog.value = false
}
function onUserAbort() {
  emit('abort')
  dialog.value = false
}
function onModelValueChange() {
  // detect ESC or outside click as abort
  // (mode-value change does not triggers when we set dialog.value?)
  emit('abort')
}
</script>

<template>
  <v-dialog v-model="dialog" @update:model-value="onModelValueChange" width="auto">
    <v-card
      prepend-icon="mdi-exclamation-thick"
      title="Confirm deletion"
      text="Deletion is final and non-reversible. Do you want to continue?"
      class="pa-2"
    >
      <template #actions>
        <v-btn @click="onUserConfirm" variant="tonal" color="error">Confirm</v-btn>
        <v-btn @click="onUserAbort" variant="tonal" color="primary">Abort</v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
