<script setup lang="ts">
import { computed, ref, toRaw } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import type { ResultTypes } from '@/components/EditorConfirmChangesDialog.vue'
import EditorConfirmChangesDialog from '@/components/EditorConfirmChangesDialog.vue'
import EditorConfirmDeletionDialog from '@/components/EditorConfirmDeletionDialog.vue'
import EditorFieldsInternals from '@/components/EditorFieldsInternals.vue'
import EditorFieldsRelated from '@/components/EditorFieldsRelated.vue'
import EditorFieldsRelatedURLs from '@/components/EditorFieldsRelatedURLs.vue'
import type { NavigateToFunc } from '@/composables/useEditorObject'
import type { Card, Item, Place, Transaction } from '@/model/interfaces'
import type { EditRouteNames } from '@/router/routes'
import { useSettingsStore } from '@/stores/settings'
import { useTemplatesStore } from '@/stores/templates'

const settings = useSettingsStore()
const templatesStore = useTemplatesStore()

const object = defineModel<Item | Transaction | Place | Card>()

const {
  objectType,
  objectChanged,
  existsInStore,
  showSetAsTemplate = true,
  isDraft,
  title,
  save: saveObject,
  saveAsDraft: saveObjectAsDraft,
  setAsTemplate: setObjectAsTemplate,
  delete: deleteObject,
  discardChanges,
  navigateTo,
} = defineProps<{
  objectType: 'item' | 'transaction' | 'place' | 'card'
  objectChanged: boolean
  existsInStore: boolean
  showSetAsTemplate?: boolean
  isDraft: boolean
  title: string
  save: () => Promise<void>
  saveAsDraft: (replaceHistory?: boolean) => Promise<void>
  setAsTemplate: () => Promise<void>
  delete: () => Promise<void>
  discardChanges: () => void
  navigateTo: NavigateToFunc
}>()

const emit = defineEmits<{
  save: []
  delete: []
  leaveAction: [type: ResultTypes]
}>()

// defineSlots<{
//   default(props: { object: Item | Transaction | Place | Card }): any
// }>()

const dialogToAskUserAboutChanges = ref<boolean>(false)
const dialogToAskUserToConfirmDeletion = ref<boolean>(false)

const hasTemplate = computed(() => templatesStore.has(objectType))
// only "from template" if not already saved as wip or normal object in store
const objectIsLikelyOnlyTemplate = computed(() => hasTemplate.value && !(existsInStore || isDraft))

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

async function onRelationEdit(id: string, type: string) {
  if (!object.value) return

  await saveObjectAsDraft()
  await navigateTo(`${type}-edit` as EditRouteNames, { id })
}
// explicit user save/delete actions
async function onSave() {
  if (!object.value) return
  console.log('Save', objectType, toRaw(object.value))

  await saveObject()

  emit('save')
}
async function onSaveAsDraft() {
  if (!object.value) return
  console.log('Save (as draft)', objectType, toRaw(object.value))

  await saveObjectAsDraft()
}
async function onSetAsTemplate() {
  if (!object.value) return
  console.log('Set as Template', objectType, toRaw(object.value))

  await setObjectAsTemplate()
}
function onDiscardChanges() {
  discardChanges()
}
function onDelete() {
  // show confirm deletion dialog
  dialogToAskUserToConfirmDeletion.value = true
}
// handle user choice from dialog (handle unsaved changes on leave page)
async function onUserChoice(type: ResultTypes) {
  if (type === 'save') {
    await saveObject()
  } else if (type === 'save-draft') {
    await saveObjectAsDraft()
  } else if (type === 'set-as-template') {
    await setObjectAsTemplate()
  } else if (type === 'discard-changes') {
    discardChanges()
  }

  emit('leaveAction', type)
}
// handle user choice from dialog (confirm deletion)
async function onUserConfirmDeletion() {
  if (!object.value) return
  console.log('Delete', objectType, toRaw(object.value))

  await deleteObject()

  emit('delete')
}
</script>

<template>
  <h1 class="mb-3">
    {{ title }}<template v-if="objectChanged"> [changed]</template
    ><template v-if="objectIsLikelyOnlyTemplate"> [from Template]</template>
  </h1>

  <v-form v-if="object">
    <slot :object="object" :object-type="objectType"></slot>

    <EditorFieldsRelatedURLs v-model="object" :object-type="objectType"></EditorFieldsRelatedURLs>

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
      <v-btn
        v-if="objectChanged || hasTemplate"
        color="secondary"
        text="Save as Draft"
        @click="onSaveAsDraft"
      ></v-btn>
      <v-btn
        v-if="showSetAsTemplate"
        color="secondary"
        :text="hasTemplate ? 'Set as new Template' : 'Set as Template'"
        @click="onSetAsTemplate"
      ></v-btn>
      <v-btn
        v-if="objectChanged"
        color="warning"
        text="Discard Changes"
        @click="onDiscardChanges"
      ></v-btn>
      <v-btn v-if="existsInStore" color="error" text="Delete" @click="onDelete"></v-btn>
    </div>
  </v-form>

  <p v-else>Loading ...</p>

  <EditorConfirmChangesDialog
    v-model="dialogToAskUserAboutChanges"
    :is-draft="isDraft"
    :has-template="hasTemplate"
    :show-set-as-template-button="showSetAsTemplate"
    @result="onUserChoice"
  ></EditorConfirmChangesDialog>
  <EditorConfirmDeletionDialog
    v-model="dialogToAskUserToConfirmDeletion"
    @confirm="onUserConfirmDeletion"
  ></EditorConfirmDeletionDialog>
</template>
