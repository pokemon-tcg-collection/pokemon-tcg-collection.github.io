import type { FilterMatch } from 'vuetify'
import type { FilterMatchArrayMultiple } from 'vuetify/lib/composables/filter.mjs'
import { defaultFilter, highlightResult } from 'vuetify/lib/composables/filter.mjs'
import type { ListItem } from 'vuetify/lib/composables/list-items.mjs'

/**
 * Generate VNodes (or string if not match) for VAutocomplete item rendering.
 * User filter queries will be checked against item title and matches (multiple possible) will be wrapped.
 *
 * @see {@link defaultFilter} for search query processing
 * @see {@link highlightResult} for highlight element wrapping and class names
 *
 * @param {any} item Autocomplete item (should contain a `.title` attribute)
 * @param {string} query User query when filtering autocomplete input
 * @returns string or VNodes
 */
export function highlightAutocompleteItem(item: ListItem, query: string) {
  // https://github.com/vuetifyjs/vuetify/blob/v3.8.12/packages/vuetify/src/composables/filter.tsx
  // https://github.com/vuetifyjs/vuetify/blob/v3.8.12/packages/vuetify/src/components/VAutocomplete/VAutocomplete.tsx

  if (!item) return undefined

  const value = item.title
  if (!query) return value

  // default autocomplete search filter
  const match = defaultFilter(value, query, item)
  if (!match) return value

  // TODO: is this required, it is called in filter processing
  const matchNormalized = normaliseMatch(match, query)

  const vnodes = highlightResult('v-autocomplete', value, matchNormalized)
  return vnodes
}

// Non-public helper function, might not be required?
// see: vuetify/lib/composables/filter
// https://github.com/vuetifyjs/vuetify/blob/v3.8.12/packages/vuetify/src/composables/filter.tsx
function normaliseMatch(match: FilterMatch, query: string): FilterMatchArrayMultiple | undefined {
  if (match == null || typeof match === 'boolean' || match === -1) return
  if (typeof match === 'number') return [[match, match + query.length]]
  if (Array.isArray(match[0])) return match as FilterMatchArrayMultiple
  return [match] as FilterMatchArrayMultiple
}
