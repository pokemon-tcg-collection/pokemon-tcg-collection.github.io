<script setup lang="ts">
import EditorFieldset from '@/components/EditorFieldset.vue'
import type { Base, RelatedURL } from '@/model/interfaces'

const object = defineModel<Base>({ required: true })

function onAddNewRelatedURL() {
  if (object.value.related_urls === undefined) object.value.related_urls = []

  object.value.related_urls.push({
    url: '',
    name: '',
  } satisfies RelatedURL)
}
function onRemoveURL(url_idx: number) {
  object.value.related_urls =
    object.value.related_urls?.filter((_val, idx) => idx !== url_idx) ?? []
}
</script>

<template>
  <EditorFieldset label="Related URLs">
    <v-row class="gc-5 ms-0 me-0" v-for="(url, i) in object.related_urls" :key="i">
      <v-text-field
        v-model="url.name"
        min-width="10rem"
        width="max-content"
        label="Description"
      ></v-text-field>
      <v-text-field v-model="url.url" min-width="15rem" width="max-content" label="URL">
        <template v-slot:append>
          <v-btn flat icon="mdi-delete" @click="() => onRemoveURL(i)"></v-btn>
        </template>
      </v-text-field>
    </v-row>

    <v-divider
      class="mt-2 mb-4"
      v-if="object.related_urls !== undefined && object.related_urls.length > 0"
    ></v-divider>

    <v-btn @click="onAddNewRelatedURL">Add more</v-btn>
  </EditorFieldset>
</template>
