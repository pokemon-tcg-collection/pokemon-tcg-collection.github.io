<script setup lang="ts">
import { computed } from 'vue'

import EditorFieldset from '@/components/EditorFieldset.vue'
import type { Base } from '@/model/interfaces'
import type { ObjectType, RelatedIDs } from '@/stores/_relations'
import { gatherRelations } from '@/stores/_relations'
import { useSettingsStore } from '@/stores/settings'

// -------------------------------------------------------------------------

const props = defineProps<{
  object: Base
  objectType: ObjectType
  direction?: 'incoming' | 'outgoing' | 'both'
}>()
const emit = defineEmits<{ edit: [id: string, type: string] }>()

const settings = useSettingsStore()

// -------------------------------------------------------------------------

function formatSubtitle(related: RelatedIDs): string {
  return [
    related.type,
    settings.editorShowInternalID ? `${related.id}` : undefined,
    related.direction,
    related.outgoingTargetExists === false ? 'invalid!' : undefined,
  ]
    .filter(Boolean)
    .join(' - ')
}
function formatColor(related: RelatedIDs): string | undefined {
  return related.outgoingTargetExists === false ? 'error' : undefined
}

const related_ids = computed<RelatedIDs[]>(() =>
  gatherRelations(props.object, props.objectType, props.direction, true),
)

function onEdit(id: string, type: string) {
  // :to="{ name: `${related.type}-edit`, params: { id: related.id } }"
  // TODO: better with handler to save state (WIP) if dirty and return query

  emit('edit', id, type)
}
</script>

<template>
  <EditorFieldset v-if="related_ids.length > 0" label="Relations">
    <v-list class="pt-0">
      <v-list-item
        v-for="related of related_ids"
        :key="related.id"
        :title="related.name"
        :subtitle="formatSubtitle(related)"
        :base-color="formatColor(related)"
        link
      >
        <template #prepend>
          <v-icon
            :color="formatColor(related)"
            :icon="
              related.direction === 'incoming' ? 'mdi-arrow-bottom-right' : 'mdi-arrow-top-right'
            "
          ></v-icon>
        </template>
        <template #append>
          <v-btn flat @click="() => onEdit(related.id, related.type)" prepend-icon="mdi-file-edit"
            >Edit</v-btn
          >
        </template>
      </v-list-item>
    </v-list>
  </EditorFieldset>
</template>
