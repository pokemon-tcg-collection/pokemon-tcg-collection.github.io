<script setup lang="ts">
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()

const props = defineProps<{
  title: string
  icon: string
  to: string | RouteLocationAsPathGeneric | RouteLocationAsRelativeGeneric | undefined
  toLabel: string
}>()
</script>

<template>
  <v-card
    v-if="mdAndUp"
    :prepend-icon="props.icon"
    :title="props.title"
    class="flex-grow-1 d-flex flex-column"
  >
    <v-card-text class="bg-surface-light pt-4 flex-grow-1">
      <slot></slot>
    </v-card-text>
    <v-card-actions>
      <v-btn :to="props.to" :text="props.toLabel"></v-btn>
    </v-card-actions>
  </v-card>

  <v-card
    v-else
    :to="props.to"
    class="d-flex flex-column justify-center align-center py-4 px-6"
    :title="props.title"
  >
    <v-card-text class="mt-3 mb-5">
      <v-sheet class="d-flex justify-center align-center pa-3" :elevation="1" border rounded>
        <v-icon :icon="props.icon" :style="{ '--v-icon-size-multiplier': 3 }"></v-icon>
      </v-sheet>
    </v-card-text>
  </v-card>
</template>
