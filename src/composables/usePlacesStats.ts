import { computed } from 'vue'

import { usePlacesStore } from '@/stores/places'

export default function usePlacesStats() {
  const placesStore = usePlacesStore()

  const numPlaces = computed(() => placesStore.places.size)

  const numOnline = computed(
    () =>
      Array.from(placesStore.places.values()).filter(
        (place) => place.type === 'online-marketplace' || place.type === 'online-shop',
      ).length,
  )
  const numLocal = computed(
    () =>
      Array.from(placesStore.places.values()).filter(
        (place) => place.type === 'local-fair' || place.type === 'local-store',
      ).length,
  )

  return { numPlaces, numOnline, numLocal }
}
