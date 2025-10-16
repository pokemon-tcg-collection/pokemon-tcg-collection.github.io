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
import { ref } from 'vue'

import { useAuditLogStore } from '@/stores/auditLog'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useTransactionsStore } from '@/stores/transactions'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const cardsStore = useCardsStore()
const transactionsStore = useTransactionsStore()
const placesStore = usePlacesStore()
const itemsStore = useItemsStore()
const wipStore = useWorkInProgressStore()
const auditLogStore = useAuditLogStore()

type ExportableObjects = 'cards' | 'transactions' | 'places' | 'items' | 'wip' | 'audit'

const FILENAME_BAGIT = 'bagit.txt'
const FILENAME_CARDS = 'data/cards.json'
const FILENAME_TRANSACTIONS = 'data/transactions.json'
const FILENAME_PLACES = 'data/places.json'
const FILENAME_ITEMS = 'data/items.json'
const FILENAME_WIPOBJS = 'data/wipobjs.json'
const FILENAME_AUDITLOG = 'data/auditLog.json'

const exportItems = ref<ExportableObjects[]>(['cards', 'transactions', 'places', 'items'])
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
async function createZipBlob(objects: ExportableObjects[]) {
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
    'Source-Organization: Pokemon TCG Collector\n',
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

  await zipReader.close()

  return result
}

async function onExport() {
  if (exportItems.value.length === 0) return

  await auditLogStore.add('Export database', { toExport: exportItems.value })

  const zipFileBlob = await createZipBlob(exportItems.value)
  triggerDownload(zipFileBlob, 'poketcgcollector.zip')
}
async function onImport() {
  console.debug('import', uploadFile.value)
  if (!uploadFile.value) return

  const zipFile = uploadFile.value
  const result = await loadData(zipFile, {
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
  })

  // clear afterwards
  uploadFile.value = undefined
}
async function onDelete() {
  // TODO: confirm?
  // see v-confirm-edit

  // TODO: append database contents to entry?
  await auditLogStore.add('Delete database')

  cardsStore.$reset()
  transactionsStore.$reset()
  placesStore.$reset()
  itemsStore.$reset()
  wipStore.$reset()

  // NOTE: does it make sense to delete audit logs? Let's keep them
  // auditLogStore.$reset()
}
</script>

<template>
  <h1 class="mb-3">Database</h1>

  <fieldset class="pa-3 my-2">
    <legend>Statistics</legend>

    <v-container class="d-flex flex-wrap flex-sm-column flex-md-row ga-3">
      <v-card title="Cards">
        <v-card-item>{{ cardsStore.cards.size }} card entries</v-card-item>
      </v-card>
      <v-card title="Transactions">
        <v-card-item>{{ transactionsStore.transactions.size }} transaction entries</v-card-item>
      </v-card>
      <v-card title="Places">
        <v-card-item>{{ placesStore.places.size }} place entries</v-card-item>
      </v-card>
      <v-card title="Items">
        <v-card-item>{{ itemsStore.items.size }} item entries</v-card-item>
      </v-card>
      <v-card title="Work in Progress">
        <v-card-item>{{ wipStore.objects.size }} WIP objects</v-card-item>
      </v-card>
      <v-card title="Audit Log">
        <v-card-item>{{ auditLogStore.logs.length }} log entries</v-card-item>
      </v-card>
    </v-container>
  </fieldset>

  <v-form>
    <fieldset class="pa-3 my-2">
      <legend>Export data</legend>
      <v-checkbox
        v-model="exportItems"
        value="cards"
        multiple
        hide-details
        label="Cards"
      ></v-checkbox>
      <v-checkbox
        v-model="exportItems"
        value="transactions"
        multiple
        hide-details
        label="Transactions"
      ></v-checkbox>
      <v-checkbox
        v-model="exportItems"
        value="places"
        multiple
        hide-details
        label="Places"
      ></v-checkbox>
      <v-checkbox
        v-model="exportItems"
        value="items"
        multiple
        hide-details
        label="Items"
      ></v-checkbox>
      <v-checkbox
        v-model="exportItems"
        value="wip"
        multiple
        hide-details
        label="Work-in-Progress Objects"
      ></v-checkbox>
      <v-checkbox
        v-model="exportItems"
        value="audit"
        multiple
        hide-details
        label="Audit Log"
      ></v-checkbox>

      <v-btn
        color="primary"
        :disabled="exportItems.length === 0"
        class="mt-3"
        @click="onExport"
        text="Export"
      ></v-btn>
    </fieldset>
  </v-form>

  <v-form>
    <fieldset class="pa-3 my-2">
      <legend>Import data</legend>

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
        title="Click to browse, or drag and drop PokeTCGCollector ZIP file here"
        filter-by-type=".zip,application/x-zip-compressed"
        show-size
        class="mt-3"
      >
      </v-file-upload>

      <v-btn
        :disabled="uploadFile === undefined"
        color="primary"
        class="mt-3"
        @click="onImport"
        text="Import"
      ></v-btn>
    </fieldset>
  </v-form>

  <v-form>
    <fieldset class="pa-3 my-2">
      <legend>Actions</legend>

      <v-btn color="error" @click="onDelete">Delete all data</v-btn>
    </fieldset>
  </v-form>
</template>

<style lang="css" scoped>
fieldset > legend {
  padding-inline: 0.3rem;
}
</style>
