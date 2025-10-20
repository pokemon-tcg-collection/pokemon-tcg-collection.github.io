<script setup lang="ts">
import type { CardResume, Set, SetResume, SupportedLanguages, Card as TCGCard } from '@tcgdex/sdk'
import TCGdex, { CardResumeModel, Query, SetResumeModel } from '@tcgdex/sdk'
import { computed, readonly, ref, watch } from 'vue'

import { CARD_LANGUAGES, TCGDEX_LANGUAGES } from '@/model/interfaces'

const emit = defineEmits<{ cardSelected: [card: TCGCard] }>()

const languages = readonly(CARD_LANGUAGES)
const sets = ref<{ id: string; label: string; image?: string; set?: SetResume }[]>([])
const cards = ref<{ id: string; label: string; image?: string; card?: CardResume }[]>([])
const boosters = ref<{ id: string; label: string }[]>([])

// TODO: maybe use settings for default
const language = ref<SupportedLanguages>('en')
const set = ref<string>()
const booster = ref<string>()
const tcgdex_id = ref<string>()

const isLoadingSets = ref(false)
const isLoadingCards = ref(false)

const tcgdex = computed(() => {
  const tcgdex_language = TCGDEX_LANGUAGES.includes(language.value as unknown as SupportedLanguages)
    ? language.value
    : 'en'
  const tcgdex = new TCGdex(tcgdex_language as SupportedLanguages)
  console.log('Creating new TCGDex API adapter', tcgdex)
  Object.assign(window, { tcgdex })
  return tcgdex
})

async function updateTCGData() {
  if (!tcgdex.value) {
    console.warn('API not ready!')
    return
  }

  console.debug('Updating TCG data ...')

  isLoadingSets.value = true

  const tcgSets = await tcgdex.value.set.list()
  sets.value = tcgSets.map((set) => ({
    id: set.id,
    label: set.name,
    image: set.symbol ? `${set.symbol}.png` : undefined,
    set: set,
  }))

  isLoadingSets.value = false
}
async function updateTCGCardData() {
  if (!tcgdex.value) {
    console.warn('API not ready!')
    return
  }

  const newSetId = set.value
  if (!newSetId) {
    cards.value = []
    return
  }

  console.debug('Updating TCG card data ...')

  isLoadingCards.value = true
  // TODO: clear out selected card?

  await onSetSelected(newSetId)

  const tcgCards = await tcgdex.value.card.list(Query.create().equal('set', newSetId))
  cards.value = tcgCards.map((setCard) => ({
    id: setCard.id,
    label: setCard.name,
    // image: setCard.image ? setCard.getImageURL('low', 'png') : undefined,
    card: setCard,
  }))

  isLoadingCards.value = false
}

async function onSetSelected(setId: string) {
  if (!tcgdex.value) {
    console.warn('API not ready!')
    return
  }

  let tcgSet: Set | null | undefined = undefined

  if (sets.value.length > 0) {
    const tcgSetInfo = sets.value.find((set) => set.id === setId)?.set
    if (tcgSetInfo !== undefined && tcgSetInfo instanceof SetResumeModel) {
      tcgSet = await tcgSetInfo.getSet()
    }
  }
  if (tcgSet === undefined) {
    tcgSet = await tcgdex.value.set.get(setId)
  }
  console.debug('Set', tcgSet)
  if (tcgSet === undefined || tcgSet === null) return
}
async function onCardSelected(cardId: string) {
  if (!tcgdex.value) {
    console.warn('API not ready!')
    return
  }

  let tcgCard: TCGCard | null | undefined = undefined

  if (cards.value.length > 0) {
    const tcgCardInfo = cards.value.find((card) => card.id === cardId)?.card
    if (tcgCardInfo !== undefined && tcgCardInfo instanceof CardResumeModel) {
      tcgCard = await tcgCardInfo.getCard()
    }
  }
  if (tcgCard === undefined) {
    tcgCard = await tcgdex.value.card.get(cardId)
  }
  console.debug('Card', tcgCard)
  if (tcgCard === undefined || tcgCard === null) return

  // card.value.number = tcgCard.localId
  // card.value.name = tcgCard.name
  tcgdex_id.value = tcgCard.id

  boosters.value =
    tcgCard.boosters?.map((booster) => ({ id: booster.id, label: booster.name })) ?? []

  emit('cardSelected', tcgCard)
}

// on load and on language change, update set list
watch(
  tcgdex,
  (n, o) => {
    if (n === o || !n) return
    updateTCGData()
    // if card already has a set selected
    updateTCGCardData()
  },
  { immediate: true },
)
// on set change, update card list
watch(
  () => set.value,
  (n, o) => {
    if (n === o) return
    updateTCGCardData()
  },
)
</script>

<template>
  <v-autocomplete
    v-model="language"
    :items="languages"
    item-value="code"
    item-title="name"
    label="Language"
  ></v-autocomplete>

  <v-autocomplete
    v-model="set"
    @update:model-value="onSetSelected"
    :items="sets"
    item-value="id"
    item-title="label"
    :loading="isLoadingSets"
    label="Name of Set"
    clearable
    hide-no-data
  >
    <template v-slot:item="{ item, props }">
      <v-list-item
        v-bind="props"
        :prepend-avatar="item.raw.image || (true as unknown as undefined)"
      ></v-list-item>
    </template>
  </v-autocomplete>

  <v-autocomplete
    v-model="tcgdex_id"
    @update:model-value="onCardSelected"
    :items="cards"
    item-value="id"
    item-title="label"
    :loading="isLoadingCards"
    label="Card"
    clearable
    hide-no-data
  ></v-autocomplete>

  <v-autocomplete
    v-model="booster"
    :items="boosters"
    item-value="id"
    item-title="label"
    label="Booster"
    clearable
    hide-no-data
  ></v-autocomplete>
</template>
