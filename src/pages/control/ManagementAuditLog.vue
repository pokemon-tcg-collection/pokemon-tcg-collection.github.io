<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'
import type { DataTableHeader, DataTableSortItem } from 'vuetify'

import type { AuditMessage } from '@/stores/auditLog'
import { useAuditLogStore } from '@/stores/auditLog'
import { sortDates } from '@/utils/sorting'

const auditLogStore = useAuditLogStore()

const showAuditInfoDialog = ref<boolean>(false)
const selectedAuditInfo = ref<AuditMessage>()

const dialogTitle = computed(() => {
  const title = 'Log Entry'
  if (selectedAuditInfo.value) {
    return `${title}: ${selectedAuditInfo.value.msg}`
  }
  return title
})
const auditDatetime = computed(() => (!selectedAuditInfo.value ? '' : selectedAuditInfo.value.date))
const auditPath = computed(() => (!selectedAuditInfo.value ? '' : selectedAuditInfo.value.path))
const auditMsg = computed(() => (!selectedAuditInfo.value ? '' : selectedAuditInfo.value.msg))
const auditParamsJSON = computed(() => {
  if (!selectedAuditInfo.value) return ''

  return JSON.stringify(selectedAuditInfo.value.params, undefined, 2)
})

const {
  copy,
  copied,
  isSupported: isClipboardSupported,
} = useClipboard({ source: auditParamsJSON })

const headers: DataTableHeader[] = [
  {
    title: 'Date',
    key: 'date',
    value: (item) => (item.date ? new Date(item.date).toLocaleString() : '–'),
    sortRaw: (a, b) => sortDates(a.date, b.date),
    cellProps: ({ item }) => ({
      title: item.date,
      style: { whiteSpace: 'nowrap' },
    }),
    minWidth: 'fit-content',
    width: 0,
  },
  {
    title: 'Message',
    key: 'msg',
  },
  {
    title: 'URL Route',
    key: 'path',
  },
  {
    title: 'Extra Params',
    key: 'params',
    value: (item) => (!!item.params ? `${JSON.stringify(item.params).length} B` : '–'),
    sortRaw: (a, b) =>
      (!!a.params ? JSON.stringify(a.params).length : 0) -
      (!!b.params ? JSON.stringify(b.params).length : 0),
    minWidth: 'fit-content',
    width: 0,
    headerProps: {
      style: { whiteSpace: 'nowrap' },
    },
    cellProps: {
      style: { whiteSpace: 'nowrap' },
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    minWidth: 'fit-content',
    width: 0,
  },
]
const sortBy: DataTableSortItem[] = [{ key: 'date', order: 'desc' }]

function onShowAuditInfo(log: AuditMessage) {
  if (!log) return

  selectedAuditInfo.value = log
  showAuditInfoDialog.value = true
}
async function onCopyAuditParamsJSON(event: MouseEvent) {
  // stop auto-focus change to textarea
  event.stopPropagation()
  // copy
  await copy()
}
</script>

<template>
  <h1 class="mb-3">Audit Log</h1>

  <p class="mb-3">{{ auditLogStore.logs.length }} entries</p>

  <v-data-table
    v-if="auditLogStore.logs.length > 0"
    :headers="headers"
    :items="auditLogStore.logs"
    item-key="id"
    :sort-by="sortBy"
    :multi-sort="{ mode: 'append', key: 'ctrl' }"
    :hide-default-footer="auditLogStore.logs.length < 11"
    density="compact"
    striped="even"
  >
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.actions="{ item }">
      <v-btn-group density="compact" variant="text">
        <v-btn @click="() => onShowAuditInfo(item)" prepend-icon="mdi-eye">Inspect</v-btn>
      </v-btn-group>
    </template>
  </v-data-table>

  <v-dialog v-model="showAuditInfoDialog">
    <v-card :title="dialogTitle">
      <v-divider></v-divider>
      <v-card-text>
        <v-text-field
          v-model:model-value="auditDatetime"
          label="Date and Time"
          variant="outlined"
          readonly
        ></v-text-field>
        <v-text-field
          v-model:model-value="auditMsg"
          label="Message"
          variant="outlined"
          readonly
        ></v-text-field>
        <v-text-field
          v-if="auditPath"
          v-model:model-value="auditPath"
          label="Route"
          variant="outlined"
          readonly
        >
          <template #append>
            <v-btn :to="auditPath" text="Go" class="fill-height"></v-btn>
          </template>
        </v-text-field>
        <v-textarea
          v-if="auditParamsJSON"
          v-model:model-value="auditParamsJSON"
          label="Data"
          variant="outlined"
          readonly
          auto-grow
          counter
          persistent-counter
          class="font-monospace"
        >
          <template #append-inner v-if="isClipboardSupported">
            <v-btn
              class="position-absolute right-0 me-3"
              :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
              :readonly="copied"
              @click="onCopyAuditParamsJSON"
            ></v-btn>
          </template>
        </v-textarea>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn text="Close" variant="plain" @click="showAuditInfoDialog = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="css">
/* too confusing */
.v-textarea.font-monospace textarea {
  font-family: monospace;
}
</style>
