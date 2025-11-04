<script setup lang="ts">
import { ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import type { ResultTypes } from '@/components/EditorConfirmChangesDialog.vue'
import EditorConfirmChangesDialog from '@/components/EditorConfirmChangesDialog.vue'
import EditorConfirmDeletionDialog from '@/components/EditorConfirmDeletionDialog.vue'
import EditorFieldsInternals from '@/components/EditorFieldsInternals.vue'
import EditorFieldsRelated from '@/components/EditorFieldsRelated.vue'
import EditorFieldsRelatedURLs from '@/components/EditorFieldsRelatedURLs.vue'
import type { Card, Item, Place, Transaction } from '@/model/interfaces'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()

const object = defineModel<Item | Transaction | Place | Card>()

const { objectType, objectChanged, existsInStore, title } = defineProps<{
  objectType: 'item' | 'transaction' | 'place' | 'card'
  objectChanged: boolean
  existsInStore: boolean
  isDraft: boolean
  title: string
}>()

const emit = defineEmits<{
  relationEdit: [id: string, type: string]
  save: []
  delete: []
  leaveAction: [type: ResultTypes]
}>()

// defineSlots<{
//   default(props: { object: Item | Transaction | Place | Card }): any
// }>()

const dialogToAskUserAboutChanges = ref<boolean>(false)
const dialogToAskUserToConfirmDeletion = ref<boolean>(false)

onBeforeRouteLeave(async (to, from) => {
  if (!object.value) return true

  console.debug('onBeforeRouteLeave', `${String(from.name)} --> ${String(to.name)}`)
  if (
    from.name === `${objectType}-new` &&
    to.name === `${objectType}-edit` &&
    to.params.id === object.value.id
  ) {
    return true
  }

  if (objectChanged) {
    dialogToAskUserAboutChanges.value = true
    return false
  }
})

// TODO: unused?
function onRelationEdit(id: string, type: string) {
  emit('relationEdit', id, type)
}
// explicit user save/delete actions
function onSave() {
  emit('save')
}
function onDelete() {
  // show confirm deletion dialog
  dialogToAskUserToConfirmDeletion.value = true
}
// handle user choice from dialog (handle unsaved changes on leave page)
function onUserChoice(type: ResultTypes) {
  emit('leaveAction', type)
}
// handle user choice from dialog (confirm deletion)
function onUserConfirmDeletion() {
  emit('delete')
}
</script>

<template>
  <h1 class="mb-3">{{ title }}<template v-if="objectChanged"> [changed]</template></h1>

  <v-form v-if="object">
    <slot :object="object" :object-type="objectType"></slot>

    <EditorFieldsRelatedURLs v-model="object"></EditorFieldsRelatedURLs>

    <EditorFieldsRelated
      v-if="settings.editorShowObjectRelations"
      :object="object"
      :object-type="objectType"
      direction="both"
      @edit="onRelationEdit"
    ></EditorFieldsRelated>

    <EditorFieldsInternals
      v-if="settings.editorShowObjectInternals"
      v-model="object"
    ></EditorFieldsInternals>

    <div class="d-flex flex-column flex-sm-row ga-3 mt-3">
      <v-btn color="primary" text="Save" @click="onSave"></v-btn>
      <v-btn v-if="existsInStore" color="error" text="Delete" @click="onDelete"></v-btn>
    </div>
  </v-form>

  <p v-else>Loading ...</p>

  <EditorConfirmChangesDialog
    v-model="dialogToAskUserAboutChanges"
    :is-draft="isDraft"
    @result="onUserChoice"
  ></EditorConfirmChangesDialog>
  <EditorConfirmDeletionDialog
    v-model="dialogToAskUserToConfirmDeletion"
    @confirm="onUserConfirmDeletion"
  ></EditorConfirmDeletionDialog>
</template>
