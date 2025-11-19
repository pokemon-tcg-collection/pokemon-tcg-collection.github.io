<script setup lang="ts">
import { computed, ref, toRaw } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import type { ResultTypes } from '@/components/EditorConfirmChangesDialog.vue'
import EditorConfirmChangesDialog from '@/components/EditorConfirmChangesDialog.vue'
import EditorConfirmDeletionDialog from '@/components/EditorConfirmDeletionDialog.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import EditorFieldsInternals from '@/components/EditorFieldsInternals.vue'
import EditorFieldsRelated from '@/components/EditorFieldsRelated.vue'
import EditorFieldsRelatedURLs from '@/components/EditorFieldsRelatedURLs.vue'
import type { NavigateToFunc, ObjectSource, ReloadFunc } from '@/composables/useEditorObject'
import type { Card, Item, Place, Transaction } from '@/model/interfaces'
import type { EditRouteNames } from '@/router/routes'
import { useSettingsStore } from '@/stores/settings'
import { useTemplatesStore } from '@/stores/templates'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const settings = useSettingsStore()
const wipStore = useWorkInProgressStore()
const templatesStore = useTemplatesStore()

const object = defineModel<Item | Transaction | Place | Card>()

const {
  objectType,
  objectChanged,
  objectSource,
  existsInStore,
  showSetAsTemplate = true,
  title,
  save: saveObject,
  saveAsDraft: saveObjectAsDraft,
  setAsTemplate: setObjectAsTemplate,
  delete: deleteObject,
  discardChanges,
  navigateTo,
  reload: reloadObject,
} = defineProps<{
  objectType: 'item' | 'transaction' | 'place' | 'card'
  objectChanged: boolean
  objectSource: ObjectSource | undefined
  existsInStore: boolean
  showSetAsTemplate?: boolean
  title: string
  save: () => Promise<void>
  saveAsDraft: (replaceHistory?: boolean) => Promise<void>
  setAsTemplate: (replaceObjectBase?: boolean) => Promise<void>
  delete: () => Promise<void>
  discardChanges: () => void
  navigateTo: NavigateToFunc
  reload: ReloadFunc
}>()

const emit = defineEmits<{
  save: []
  delete: []
  leaveAction: [type: ResultTypes]
}>()

// defineSlots<{
//   default(props: { object: Item | Transaction | Place | Card }): any
// }>()

const objectTypeTitleCase = objectType.slice(0, 1).toUpperCase() + objectType.slice(1)

const dialogToAskUserAboutChanges = ref<boolean>(false)
const dialogToAskUserToConfirmDeletion = ref<boolean>(false)

const isDraft = computed(() => objectSource === 'wip')
const hasTemplate = computed(() => templatesStore.has(objectType))

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

  const shouldReplaceObjectBase = !(existsInStore || isDraft.value)
  console.debug('Replace object base?', shouldReplaceObjectBase, {
    existsInStore,
    isDraft: isDraft.value,
  })

  await setObjectAsTemplate(shouldReplaceObjectBase)
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

async function onDiscardDraft() {
  if (!object.value) return
  console.log('Discard draft/wip', objectType, toRaw(object.value))

  // TODO: ask for confirmation / show changes

  await wipStore.remove(object.value.id)

  // do a reload
  // NOTE: do no use browser reload, to harsh
  // router.go(0)
  // NOTE: also do not use replace with same route, as component is already loaded, no effect
  // await router.replace(router.currentRoute.value)
  // attempt to reload object in composable (if wiped from wipStore, it should load from store)
  await reloadObject()
}
async function onIgnoreTemplateStartBlank() {
  console.debug('Ignore template start from blank', objectType, toRaw(object.value), {
    objectSource,
  })

  // NOTE: this will only be called if a new object has been created (no stored objects)
  await reloadObject({ ignoreTemplate: true })
}
async function onDiscardTemplateStartBlank() {
  console.debug('Discard template start from blank', objectType, toRaw(object.value), {
    objectSource,
  })

  // remove template
  await templatesStore.remove(objectType)
  // reload object (should now be a new blank one)
  await reloadObject()
}
</script>

<template>
  <h1 class="mb-3">{{ title }}<template v-if="objectChanged"> [changed]</template></h1>

  <p v-if="objectSource === 'template'">
    <span class="text-amber-lighten-1">New {{ objectTypeTitleCase }} created from template!</span>
    <v-btn
      class="ms-2"
      variant="plain"
      density="comfortable"
      slim
      :style="{ 'vertical-align': 'baseline' }"
      @click="onIgnoreTemplateStartBlank"
      >Ignore Template, start blank?</v-btn
    >
    <v-btn
      variant="plain"
      density="comfortable"
      slim
      :style="{ 'vertical-align': 'baseline' }"
      @click="onDiscardTemplateStartBlank"
      >Discard Template, start blank?</v-btn
    >
  </p>
  <p v-if="isDraft">
    <span class="text-grey-darken-1">Loaded {{ objectTypeTitleCase }} from draft version!</span>
    <span v-if="existsInStore" class="text-amber-lighten-1">
      (Draft might differ from version saved in database.)</span
    >
    <v-btn
      v-if="existsInStore"
      class="ps-2"
      variant="plain"
      density="comfortable"
      slim
      :style="{ 'vertical-align': 'baseline' }"
      @click="onDiscardDraft"
      >Discard Changes?</v-btn
    >
  </p>
  <p v-if="existsInStore" class="text-grey-darken-1">
    A saved version of {{ objectTypeTitleCase }} exists in database.
  </p>

  <v-form v-if="object">
    <slot :object="object" :object-type="objectType"></slot>

    <EditorFieldset label="Additional">
      <v-textarea v-model="object.notes" label="Notes"></v-textarea>
    </EditorFieldset>

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
