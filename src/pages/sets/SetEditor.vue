<script setup lang="ts">
import { computed, readonly } from 'vue'
import { useDisplay } from 'vuetify'

import EditorBase from '@/components/EditorBase.vue'
import EditorFieldset from '@/components/EditorFieldset.vue'
import useEditorObject from '@/composables/useEditorObject'
import { useSetsStore } from '@/stores/sets'

const setsStore = useSetsStore()

const {
  object: set,
  objectSource: setSource,
  objectChanged: setChanged,
  existsInStore,
  objectIdFromParam: setIdFromParam,
  returnLocation,
  setAsTemplate: setSetAsTemplate,
  saveAsDraft: saveSetAsDraft,
  save: saveSet,
  delete: deleteSet,
  discardChanges,
  navigateTo,
  reload: reloadSet,
} = useEditorObject('set')
</script>

<template>
  <EditorBase
    v-model="set"
    object-type="set"
    :object-changed="setChanged"
    :object-source="setSource"
    :exists-in-store="existsInStore"
    title="Set Editor"
    :return-location="returnLocation"
    :saved-go-to-location="{ name: 'set-list' }"
    :deleted-go-to-location="{ name: 'set-list' }"
    :save="saveSet"
    :save-as-draft="saveSetAsDraft"
    :set-as-template="setSetAsTemplate"
    :delete="deleteSet"
    :discard-changes="discardChanges"
    :navigate-to="navigateTo"
    :reload="reloadSet"
  >
    <template v-if="set">
      <EditorFieldset label="Details">
        <v-text-field
          v-model="set.name"
          label="Name"
          :rules="[(val: string) => !!val && val.trim().length > 0]"
        ></v-text-field>
      </EditorFieldset>
    </template>
  </EditorBase>
</template>
