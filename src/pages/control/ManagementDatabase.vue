<script setup lang="ts">
import {
  BlobReader,
  BlobWriter,
  TextReader,
  TextWriter,
  ZipReader,
  ZipWriter,
  type FileEntry,
} from '@zip.js/zip.js'
import { computed, ref } from 'vue'

import EditorFieldset from '@/components/EditorFieldset.vue'
import type { Card, Item, Place, Set, Transaction } from '@/model/interfaces'
import { useAuditLogStore } from '@/stores/auditLog'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useSetsStore } from '@/stores/sets'
import { useTemplatesStore } from '@/stores/templates'
import { useTransactionsStore } from '@/stores/transactions'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const cardsStore = useCardsStore()
const setsStore = useSetsStore()
const transactionsStore = useTransactionsStore()
const placesStore = usePlacesStore()
const itemsStore = useItemsStore()
const wipStore = useWorkInProgressStore()
const templatesStore = useTemplatesStore()
const auditLogStore = useAuditLogStore()

type StoreObjects =
  | 'cards'
  | 'sets'
  | 'transactions'
  | 'places'
  | 'items'
  | 'wip'
  | 'templates'
  | 'audit'

type DeleteableStoreObjects =
  | 'cards'
  | 'sets'
  | 'transactions'
  | 'places'
  | 'items'
  | 'wip'
  | 'templates'

const FILENAME_BAGIT = 'bagit.txt'
const FILENAME_CARDS = 'data/cards.json'
const FILENAME_SETS = 'data/sets.json'
const FILENAME_TRANSACTIONS = 'data/transactions.json'
const FILENAME_PLACES = 'data/places.json'
const FILENAME_ITEMS = 'data/items.json'
const FILENAME_WIPOBJS = 'data/wipobjs.json'
const FILENAME_TMPLOBJS = 'data/tmplobjs.json'
const FILENAME_AUDITLOG = 'data/auditLog.json'

const STORES = [
  {
    id: 'cards',
    label: 'Cards',
    allow: ['export', 'import', 'delete', 'preload'],
    filename: FILENAME_CARDS,
    store: cardsStore,
  },
  {
    id: 'sets',
    label: 'Sets',
    allow: ['export', 'import', 'delete', 'preload'],
    filename: FILENAME_SETS,
    store: setsStore,
  },
  {
    id: 'transactions',
    label: 'Transactions',
    allow: ['export', 'import', 'delete', 'preload'],
    filename: FILENAME_TRANSACTIONS,
    store: transactionsStore,
  },
  {
    id: 'places',
    label: 'Places',
    allow: ['export', 'import', 'delete', 'preload'],
    filename: FILENAME_PLACES,
    store: placesStore,
  },
  {
    id: 'items',
    label: 'Items',
    allow: ['export', 'import', 'delete', 'preload'],
    filename: FILENAME_ITEMS,
    store: itemsStore,
  },
  // NOT: import/preload
  {
    id: 'wip',
    label: 'Work-in-Progress Objects',
    allow: ['export', 'delete'],
    filename: FILENAME_WIPOBJS,
    store: wipStore,
  },
  {
    id: 'templates',
    label: 'Templates',
    allow: ['export', 'delete'],
    filename: FILENAME_TMPLOBJS,
    store: templatesStore,
  },
  // NOT: delete?
  {
    id: 'audit',
    label: 'Audit Log',
    allow: ['export'],
    filename: FILENAME_AUDITLOG,
    store: auditLogStore,
  },
] as const

const allowedExportItems = computed(() => STORES.filter((item) => item.allow.includes('export')))
const allowedImportItems = computed(() =>
  STORES.filter((item) => (item.allow as unknown as string[]).includes('import')),
)

const exportItems = ref<StoreObjects[]>(['cards', 'sets', 'transactions', 'places', 'items'])
const importItems = ref<StoreObjects[]>(['cards', 'sets', 'transactions', 'places', 'items'])

const statisticsDeleteLocked = ref<boolean>(true)

const clearBeforeImport = ref(false)
const overwriteExisting = ref(false)
const uploadFile = ref<File>()

async function digestData(data: string, algorithm = 'SHA-256') {
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
  // encode as (utf-8) Uint8Array
  const msgUint8 = new TextEncoder().encode(data)
  const hashBuffer = await window.crypto.subtle.digest(algorithm, msgUint8)
  // convert bytes to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
async function createZipBlob(objects: StoreObjects[]) {
  const zipFileWriter = new BlobWriter()
  const zipWriter = new ZipWriter(zipFileWriter)

  const bagitData = 'BagIt-version: 1.0\nTag-File-Character-Encoding: UTF-8\n'
  const bagitReader = new TextReader(bagitData)
  await zipWriter.add(FILENAME_BAGIT, bagitReader)

  const hashes = new Map<string, string>()

  if (objects.includes('cards')) {
    const data = cardsStore.$serialize()

    const filename = FILENAME_CARDS
    const dataHash = await digestData(data)
    hashes.set(filename, dataHash)

    const reader = new TextReader(data)
    await zipWriter.add(filename, reader)
  }
  if (objects.includes('sets')) {
    const data = setsStore.$serialize()

    const filename = FILENAME_SETS
    const dataHash = await digestData(data)
    hashes.set(filename, dataHash)

    const reader = new TextReader(data)
    await zipWriter.add(filename, reader)
  }
  if (objects.includes('transactions')) {
    const data = transactionsStore.$serialize()

    const filename = FILENAME_TRANSACTIONS
    const dataHash = await digestData(data)
    hashes.set(filename, dataHash)

    const reader = new TextReader(data)
    await zipWriter.add(filename, reader)
  }
  if (objects.includes('places')) {
    const data = placesStore.$serialize()

    const filename = FILENAME_PLACES
    const dataHash = await digestData(data)
    hashes.set(filename, dataHash)

    const reader = new TextReader(data)
    await zipWriter.add(filename, reader)
  }
  if (objects.includes('items')) {
    const data = itemsStore.$serialize()

    const filename = FILENAME_ITEMS
    const dataHash = await digestData(data)
    hashes.set(filename, dataHash)

    const reader = new TextReader(data)
    await zipWriter.add(filename, reader)
  }
  if (objects.includes('wip')) {
    const data = wipStore.$serialize()

    const filename = FILENAME_WIPOBJS
    const dataHash = await digestData(data)
    hashes.set(filename, dataHash)

    const reader = new TextReader(data)
    await zipWriter.add(filename, reader)
  }
  if (objects.includes('templates')) {
    const data = templatesStore.$serialize()

    const filename = FILENAME_TMPLOBJS
    const dataHash = await digestData(data)
    hashes.set(filename, dataHash)

    const reader = new TextReader(data)
    await zipWriter.add(filename, reader)
  }
  if (objects.includes('audit')) {
    const data = auditLogStore.$serialize()

    const filename = FILENAME_AUDITLOG
    const dataHash = await digestData(data)
    hashes.set(filename, dataHash)

    const reader = new TextReader(data)
    await zipWriter.add(filename, reader)
  }

  const manifestData = Array.from(hashes.entries())
    .map(([filename, hash]) => `${hash}  ${filename}\n`)
    .join('')
  const manifestReader = new TextReader(manifestData)
  await zipWriter.add('manifest-sha256.txt', manifestReader)

  const baginfoData = [
    'Source-Organization: Pokémon TCG Collection\n',
    `Bagging-Date: ${new Date().toISOString().slice(0, 10)}\n`,
    'External-Description: Export of application database\n',
  ].join('')
  const baginfoReader = new TextReader(baginfoData)
  await zipWriter.add('bag-info.txt', baginfoReader)

  await zipWriter.close()
  const zipFileBlob = await zipFileWriter.getData()

  return zipFileBlob
}
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
async function loadData(
  blob: Blob,
  objects: StoreObjects[],
  {
    clearBefore = false,
    overwriteExisting = false,
  }: { clearBefore?: boolean; overwriteExisting?: boolean } = {},
) {
  const zipFileReader = new BlobReader(blob)
  const zipReader = new ZipReader(zipFileReader)
  const entries = await zipReader.getEntries()
  console.debug('entries', entries)
  Object.assign(window, { entries })

  const bagitEntry = entries.find((entry) => entry.filename === FILENAME_BAGIT)
  if (bagitEntry === undefined) {
    console.warn('No bagit.txt file found! Abort')
    // TODO: set error
    return false
  }

  // TODO: do we want to confirm the hashes for file integrity? Probably not
  // TODO: maybe confirm schema/model versions?

  let result = true

  if (objects.includes('cards')) {
    const cardsEntry = entries.find(
      (entry) =>
        entry.filename === FILENAME_CARDS && !entry.directory && Object.hasOwn(entry, 'getData'),
    )
    if (cardsEntry !== undefined) {
      const writer = new TextWriter()
      const data = await (cardsEntry as FileEntry).getData(writer)
      const resultForCards = cardsStore.$deserialize(data, { clearBefore, overwriteExisting })
      if (!resultForCards) {
        console.warn('Unable to cleanly import cards store!')
        // TODO: should reset completely?
      }
      result &&= resultForCards
    }
  }

  if (objects.includes('sets')) {
    const setsEntry = entries.find(
      (entry) =>
        entry.filename === FILENAME_SETS && !entry.directory && Object.hasOwn(entry, 'getData'),
    )
    if (setsEntry !== undefined) {
      const writer = new TextWriter()
      const data = await (setsEntry as FileEntry).getData(writer)
      const resultForSets = setsStore.$deserialize(data, { clearBefore, overwriteExisting })
      if (!resultForSets) {
        console.warn('Unable to cleanly import sets store!')
        // TODO: should reset completely?
      }
      result &&= resultForSets
    }
  }

  if (objects.includes('transactions')) {
    const transactionsEntry = entries.find(
      (entry) =>
        entry.filename === FILENAME_TRANSACTIONS &&
        !entry.directory &&
        Object.hasOwn(entry, 'getData'),
    )
    if (transactionsEntry !== undefined) {
      const writer = new TextWriter()
      const data = await (transactionsEntry as FileEntry).getData(writer)
      const resultForTransactions = transactionsStore.$deserialize(data, {
        clearBefore,
        overwriteExisting,
      })
      if (!resultForTransactions) {
        console.warn('Unable to cleanly import transactions store!')
        // TODO: should reset completely?
      }
      result &&= resultForTransactions
    }
  }

  if (objects.includes('places')) {
    const placesEntry = entries.find(
      (entry) =>
        entry.filename === FILENAME_PLACES && !entry.directory && Object.hasOwn(entry, 'getData'),
    )
    if (placesEntry !== undefined) {
      const writer = new TextWriter()
      const data = await (placesEntry as FileEntry).getData(writer)
      const resultForPlaces = placesStore.$deserialize(data, {
        clearBefore,
        overwriteExisting,
      })
      if (!resultForPlaces) {
        console.warn('Unable to cleanly import places store!')
        // TODO: should reset completely?
      }
      result &&= resultForPlaces
    }
  }

  if (objects.includes('items')) {
    const itemsEntry = entries.find(
      (entry) =>
        entry.filename === FILENAME_ITEMS && !entry.directory && Object.hasOwn(entry, 'getData'),
    )
    if (itemsEntry !== undefined) {
      const writer = new TextWriter()
      const data = await (itemsEntry as FileEntry).getData(writer)
      const resultForItems = itemsStore.$deserialize(data, {
        clearBefore,
        overwriteExisting,
      })
      if (!resultForItems) {
        console.warn('Unable to cleanly import items store!')
        // TODO: should reset completely?
      }
      result &&= resultForItems
    }
  }

  // TODO: wips/templates

  await zipReader.close()

  return result
}

async function onExport() {
  if (exportItems.value.length === 0) return

  await auditLogStore.add('Export database', { toExport: exportItems.value })

  const zipFileBlob = await createZipBlob(exportItems.value)
  const filename = `pokemon-tcg-collection.${new Date().toISOString().substring(0, 10)}.zip`
  triggerDownload(zipFileBlob, filename)
}
async function onExportSingle(what: StoreObjects) {
  await auditLogStore.add('Export database', { toExport: [what] })
  const zipFileBlob = await createZipBlob([what])
  const filename = `pokemon-tcg-collection.${what}.${new Date().toISOString().substring(0, 10)}.zip`
  triggerDownload(zipFileBlob, filename)
}

async function onImport() {
  if (importItems.value.length === 0) return

  console.debug('import', uploadFile.value)
  if (!uploadFile.value) return

  const zipFile = uploadFile.value
  const result = await loadData(zipFile, importItems.value, {
    clearBefore: clearBeforeImport.value,
    overwriteExisting: overwriteExisting.value,
  })

  await auditLogStore.add('Import database', {
    filename: uploadFile.value.name,
    filesize: uploadFile.value.size,
    filetype: uploadFile.value.type,
    clearBefore: clearBeforeImport.value,
    overwriteExisting: overwriteExisting.value,
    result: result,
    toImport: importItems.value,
  })

  // clear afterwards
  uploadFile.value = undefined
}

// TODO: confirm?
// see v-confirm-edit
async function onDelete() {
  // TODO: append database contents to entry?
  await auditLogStore.add('Delete database')

  await cardsStore.clear()
  cardsStore.$reset()

  await setsStore.clear()
  setsStore.$reset()

  await transactionsStore.clear()
  transactionsStore.$reset()

  await placesStore.clear()
  placesStore.$reset()

  await itemsStore.clear()
  itemsStore.$reset()

  await wipStore.clear()
  wipStore.$reset()

  await templatesStore.clear()
  templatesStore.$reset()

  // NOTE: does it make sense to delete audit logs? Let's keep them
}
async function onDeleteSingle(what: DeleteableStoreObjects) {
  if (statisticsDeleteLocked.value) return

  const info = STORES.filter((item) => (item.allow as unknown as string).includes('delete')).find(
    (item) => item.id === what,
  )
  if (info === undefined) {
    console.warn('Requested object store was not found or is not deletable!', what)
    return
  }

  await auditLogStore.add('Delete database', { toDelete: [what] })

  // hack to avoid complex type check
  const store = info.store as unknown as { clear(): Promise<void>; $reset(): void }

  await store.clear()
  store.$reset()
}

async function onLoadPreloadData() {
  const nameWithStores = [
    { name: 'places', store: placesStore },
    { name: 'items', store: itemsStore },
    { name: 'cards', store: cardsStore },
    { name: 'sets', store: setsStore },
    { name: 'transactions', store: transactionsStore },
  ] as const
  type Dataset = {
    places?: Place[]
    items?: Item[]
    transactions?: Transaction[]
    cards?: Card[]
    sets?: Set[]
  }

  async function loadData(dataset: Dataset) {
    for (const { name, store } of nameWithStores) {
      if (Object.hasOwn(dataset, name)) {
        const data = (dataset as unknown as { [key: string]: [] })[name]
        if (!data || !Array.isArray(data) || data.length === 0) return

        console.log(`🍍 Preloading data for "${store.$id}" store (${data.length} entries) ...`)
        for (const entry of data) {
          await store.add(entry, { overwrite: false })
        }
      }
    }
  }

  const { default: preloadData } = await import('@/stores/.data/preload')
  await loadData(preloadData)

  // const { default: privateData } = await import(`@/stores/.data/private`)
  // await loadData(privateData)
}
</script>

<template>
  <h1 class="mb-3">Database</h1>

  <EditorFieldset label="Statistics">
    <v-container class="d-flex flex-wrap flex-sm-column flex-md-row ga-3">
      <v-card min-width="8rem">
        <v-card-title class="text-center">{{ cardsStore.cards.size }}</v-card-title>
        <v-card-subtitle class="text-center">Cards</v-card-subtitle>
        <v-card-actions>
          <v-btn
            :disabled="cardsStore.cards.size === 0"
            icon="mdi-download"
            @click="onExportSingle('cards')"
          ></v-btn>
          <v-btn
            :disabled="statisticsDeleteLocked || cardsStore.cards.size === 0"
            :icon="statisticsDeleteLocked ? 'mdi-delete-off' : 'mdi-delete'"
            @click="onDeleteSingle('cards')"
          ></v-btn>
        </v-card-actions>
      </v-card>
      <v-card min-width="8rem">
        <v-card-title class="text-center">{{ setsStore.sets.size }}</v-card-title>
        <v-card-subtitle class="text-center">Sets</v-card-subtitle>
        <v-card-actions>
          <v-btn
            :disabled="setsStore.sets.size === 0"
            icon="mdi-download"
            @click="onExportSingle('sets')"
          ></v-btn>
          <v-btn
            :disabled="statisticsDeleteLocked || setsStore.sets.size === 0"
            :icon="statisticsDeleteLocked ? 'mdi-delete-off' : 'mdi-delete'"
            @click="onDeleteSingle('sets')"
          ></v-btn>
        </v-card-actions>
      </v-card>
      <v-card min-width="8rem">
        <v-card-title class="text-center">{{ transactionsStore.transactions.size }}</v-card-title>
        <v-card-subtitle class="text-center">Transactions</v-card-subtitle>
        <v-card-actions>
          <v-btn
            :disabled="transactionsStore.transactions.size === 0"
            icon="mdi-download"
            @click="onExportSingle('transactions')"
          ></v-btn>
          <v-btn
            :disabled="statisticsDeleteLocked || transactionsStore.transactions.size === 0"
            :icon="statisticsDeleteLocked ? 'mdi-delete-off' : 'mdi-delete'"
            @click="onDeleteSingle('transactions')"
          ></v-btn>
        </v-card-actions>
      </v-card>
      <v-card min-width="8rem">
        <v-card-title class="text-center">{{ placesStore.places.size }}</v-card-title>
        <v-card-subtitle class="text-center">Places</v-card-subtitle>
        <v-card-actions>
          <v-btn
            :disabled="placesStore.places.size === 0"
            icon="mdi-download"
            @click="onExportSingle('places')"
          ></v-btn>
          <v-btn
            :disabled="statisticsDeleteLocked || placesStore.places.size === 0"
            :icon="statisticsDeleteLocked ? 'mdi-delete-off' : 'mdi-delete'"
            @click="onDeleteSingle('places')"
          ></v-btn>
        </v-card-actions>
      </v-card>
      <v-card min-width="8rem">
        <v-card-title class="text-center">{{ itemsStore.items.size }}</v-card-title>
        <v-card-subtitle class="text-center">items</v-card-subtitle>
        <v-card-actions>
          <v-btn
            :disabled="itemsStore.items.size === 0"
            icon="mdi-download"
            @click="onExportSingle('items')"
          ></v-btn>
          <v-btn
            :disabled="statisticsDeleteLocked || itemsStore.items.size === 0"
            :icon="statisticsDeleteLocked ? 'mdi-delete-off' : 'mdi-delete'"
            @click="onDeleteSingle('items')"
          ></v-btn>
        </v-card-actions>
      </v-card>

      <v-card min-width="8rem">
        <v-card-title class="text-center">{{ wipStore.objects.size }}</v-card-title>
        <v-card-subtitle class="text-center">Works in Progress</v-card-subtitle>
        <v-card-actions>
          <v-btn
            :disabled="wipStore.objects.size === 0"
            icon="mdi-download"
            @click="onExportSingle('wip')"
          ></v-btn>
          <v-btn
            :disabled="statisticsDeleteLocked || wipStore.objects.size === 0"
            :icon="statisticsDeleteLocked ? 'mdi-delete-off' : 'mdi-delete'"
            @click="onDeleteSingle('wip')"
          ></v-btn>
        </v-card-actions>
      </v-card>
      <v-card min-width="8rem">
        <v-card-title class="text-center">{{ templatesStore.templates.size }}</v-card-title>
        <v-card-subtitle class="text-center">Templates</v-card-subtitle>
        <v-card-actions>
          <v-btn
            :disabled="templatesStore.templates.size === 0"
            icon="mdi-download"
            @click="onExportSingle('templates')"
          ></v-btn>
          <v-btn
            :disabled="statisticsDeleteLocked || templatesStore.templates.size === 0"
            :icon="statisticsDeleteLocked ? 'mdi-delete-off' : 'mdi-delete'"
            @click="onDeleteSingle('templates')"
          ></v-btn>
        </v-card-actions>
      </v-card>

      <v-card min-width="8rem">
        <v-card-title class="text-center">{{ auditLogStore.logs.length }}</v-card-title>
        <v-card-subtitle class="text-center">Log entries</v-card-subtitle>
        <v-card-actions>
          <v-btn
            :disabled="auditLogStore.logs.length === 0"
            icon="mdi-download"
            @click="onExportSingle('audit')"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <v-checkbox
      v-model="statisticsDeleteLocked"
      :prepend-icon="statisticsDeleteLocked ? 'mdi-lock' : 'mdi-lock-open'"
      class="ms-4"
      :label="statisticsDeleteLocked ? 'Deletion disabled' : 'Deletion allowed'"
      hide-details
    ></v-checkbox>
  </EditorFieldset>

  <v-form>
    <EditorFieldset label="Export data">
      <v-autocomplete
        v-model="exportItems"
        :items="allowedExportItems"
        item-value="id"
        item-title="label"
        label="Stores to export"
        hide-details
        chips
        closable-chips
        clearable
        multiple
      ></v-autocomplete>

      <v-btn
        color="primary"
        :disabled="exportItems.length === 0"
        class="mt-3"
        @click="onExport"
        text="Export"
      ></v-btn>
    </EditorFieldset>
  </v-form>

  <v-form>
    <EditorFieldset label="Import data">
      <v-autocomplete
        v-model="importItems"
        :items="allowedImportItems"
        item-value="id"
        item-title="label"
        label="Stores to import"
        hint="Selection allows to limit import to the intersection of available store data in the import file and the user selection. Stores not selected will not imported! Stores not in the import file can't be imported even if selected!"
        persistent-hint
        chips
        closable-chips
        clearable
        multiple
      ></v-autocomplete>

      <v-checkbox
        v-model="clearBeforeImport"
        value="audit"
        multiple
        label="Clear stores before import"
        hint="Clear any stores with existing data before the new data will be imported. If a store is not included in the imported ZIP file, it will not be cleared!"
        persistent-hint
      ></v-checkbox>
      <v-checkbox
        v-model="overwriteExisting"
        value="audit"
        multiple
        label="Overwrite existing data"
        hint="Objects are identified by a unique identifer (ID). If any current object has the same identifier, it will be overwritten! The rest will be merged together."
        persistent-hint
      ></v-checkbox>

      <v-file-upload
        v-model="uploadFile"
        name="importfile"
        density="compact"
        clearable
        title="Click to browse, or drag and drop Pokemon TCG Collection ZIP file here"
        filter-by-type=".zip,application/x-zip-compressed"
        show-size
        class="mt-3"
      >
      </v-file-upload>

      <v-btn
        :disabled="uploadFile === undefined || importItems.length === 0"
        color="primary"
        class="mt-3"
        @click="onImport"
        text="Import"
      ></v-btn>
    </EditorFieldset>
  </v-form>

  <v-form>
    <EditorFieldset label="Actions" class="d-flex flex-wrap ga-3">
      <v-btn color="error" @click="onDelete">Delete all data</v-btn>
      <v-btn @click="onLoadPreloadData">Preload stores</v-btn>
    </EditorFieldset>
  </v-form>
</template>
