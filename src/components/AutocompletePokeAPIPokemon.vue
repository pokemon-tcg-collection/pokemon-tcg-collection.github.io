<script setup lang="ts">
import { ref } from 'vue'

import { pokemon } from '@/apis/pokeapi'
import { highlightAutocompleteItem } from '@/utils/autocomplete'

const pokemon_lookup = new Map(pokemon.map((entry) => [entry.id, entry.name]))

const model = defineModel<number | undefined>()
const emit = defineEmits<{
  'update:model-value:title': [string | undefined]
}>()

const search = ref<string>('')

function onUpdateModelValue(value: number) {
  emit('update:model-value:title', pokemon_lookup.get(value))
}
</script>

<template>
  <v-autocomplete
    v-model="model"
    label="Pokemon (from PokeAPI)"
    :items="pokemon"
    item-value="id"
    item-title="name"
    clearable
    @update:search="(val) => (search = val)"
    @update:model-value="onUpdateModelValue"
  >
    <template #prepend-inner>
      <v-avatar
        :image="model ? `/pokeapi-sprites/${model}.png` : '/pokeapi-sprites/0.png'"
      ></v-avatar>
    </template>
    <template #item="{ props, item }">
      <v-list-item
        v-bind="props"
        :prepend-avatar="`/pokeapi-sprites/${item.raw.sprite ? item.raw.id : 0}.png`"
        :subtitle="`Generation: ${item.raw.generation.toLocaleUpperCase()}`"
        :title="item.raw.name"
      >
        <template #title
          ><component :is="() => highlightAutocompleteItem(item, search)"
        /></template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>
