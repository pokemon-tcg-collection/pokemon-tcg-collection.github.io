<script setup lang="ts">
import type {
  CardResume,
  SerieModel,
  Set,
  SetResume,
  SupportedLanguages,
  Card as TCGCard,
} from '@tcgdex/sdk'
import TCGdex, { CardResumeModel, Query, SetResumeModel } from '@tcgdex/sdk'
import { computed, readonly, ref, watch } from 'vue'

import { CARD_LANGUAGES, TCGDEX_LANGUAGES } from '@/model/interfaces'
import { highlightAutocompleteItem } from '@/utils/autocomplete'

interface SetItem {
  id: string
  label: string
  image?: string
  set?: SetResume
}

const emit = defineEmits<{ cardSelected: [card: TCGCard] }>()

const languages = readonly(CARD_LANGUAGES)
const sets = ref<(SetItem | { type: 'subheader'; title: string })[]>([])
const cards = ref<{ id: string; nr: string; label: string; image?: string; card?: CardResume }[]>(
  [],
)
const boosters = ref<{ id: string; label: string }[]>([])

// TODO: maybe use settings for default
const language = ref<SupportedLanguages>('en')
const set = ref<string>()
const booster = ref<string>()
const tcgdex_id = ref<string>()

const isLoadingSets = ref(false)
const isLoadingCards = ref(false)

const searchSet = ref<string>('')
const searchCard = ref<string>('')

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

  const tcgSeriesListPreview = await tcgdex.value.serie.list()
  const tcgSeriesList = (await Promise.all(
    tcgSeriesListPreview.map(async (series) => await series.getSerie()),
  )) as SerieModel[]
  Object.assign(window, { tcgSeriesList })

  sets.value = tcgSeriesList
    .map((series) =>
      (
        [{ type: 'subheader', title: series.name, series: series }] as (
          | SetItem
          | { type: 'subheader'; title: string; series: SerieModel }
        )[]
      ).concat(
        series.sets.map((set) => ({
          id: set.id,
          label: set.name,
          image: set.symbol ? `${set.symbol}.png` : undefined,
          set: set,
        })),
      ),
    )
    .flat(1)

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
    nr: setCard.localId,
    label: setCard.name,
    image: setCard.image ? setCard.getImageURL('low', 'png') : undefined,
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
    const tcgSetInfo = (sets.value.filter((set) => !Object.hasOwn(set, 'type')) as SetItem[]).find(
      (set) => set.id === setId,
    )?.set
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
    @update:search="(val) => (searchSet = val)"
    :items="sets"
    item-value="id"
    item-title="label"
    :loading="isLoadingSets"
    label="Name of Set"
    clearable
    hide-no-data
  >
    <template #subheader="{ index, props }">
      <v-divider v-if="index > 0"></v-divider>
      <v-list-item disabled :style="{ opacity: 1 }">
        <template #prepend>
          <v-avatar rounded="0" :style="{ width: '100px', height: '60px' }">
            <v-img :src="`${(props.series as SerieModel).logo}.png`" :cover="false"></v-img>
          </v-avatar>
        </template>
        <template #title>
          <v-list-item-title :style="{ opacity: 0.6 }">{{
            props.title as string
          }}</v-list-item-title>
        </template>
        <template #subtitle>
          <v-list-item-subtitle>{{
            (props.series as { releaseDate: string }).releaseDate
          }}</v-list-item-subtitle>
        </template>
      </v-list-item>
    </template>
    <template #item="{ item, props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-avatar rounded="0">
            <v-img :src="(item.raw as SetItem).image" :cover="false"></v-img>
          </v-avatar>
        </template>
        <template #title
          ><component :is="() => highlightAutocompleteItem(item, searchSet)"
        /></template>
        <template #subtitle v-if="(item.raw as SetItem).set"
          >{{ (item.raw as SetItem).set!.cardCount.official
          }}<template
            v-if="
              (item.raw as SetItem).set!.cardCount.official !==
              (item.raw as SetItem).set!.cardCount.total
            "
          >
            (+{{
              (item.raw as SetItem).set!.cardCount.total -
              (item.raw as SetItem).set!.cardCount.official
            }})</template
          >
          Cards</template
        >
      </v-list-item>
    </template>
  </v-autocomplete>

  <v-autocomplete
    v-model="tcgdex_id"
    @update:model-value="onCardSelected"
    @update:search="(val) => (searchCard = val)"
    :items="cards"
    item-value="id"
    item-title="label"
    :loading="isLoadingCards"
    label="Card"
    clearable
    hide-no-data
    :menu="true"
  >
    <template #item="{ item, props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-avatar :image="item.raw.image" rounded="0"></v-avatar>
          <span class="ms-4 text-grey-lighten-1">#{{ item.raw.nr }}</span>
        </template>
        <template #title
          ><component :is="() => highlightAutocompleteItem(item, searchCard)"
        /></template>
      </v-list-item>
    </template>
  </v-autocomplete>

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
