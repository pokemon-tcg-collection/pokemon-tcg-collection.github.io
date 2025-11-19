import { nextTick } from 'vue'
import { useRoute } from 'vue-router'

export const DEFAULT_TITLE = 'Pokémon TCG Collection'

// update page title
export function afterEachUpdatePageTitle() {
  const route = useRoute()

  // see also breadcrumbs in App.vue
  const routeNameParts = route.matched
    .filter((route) => !!route.meta.breadcrumb_name as unknown as string)
    .map((route) => (route.meta.breadcrumb_name as unknown as string) ?? route.name)
    .filter((name) => !!name)
    .toReversed()

  const titleFragment = routeNameParts.join(' – ')
  const title = !!titleFragment ? `${titleFragment} – ${DEFAULT_TITLE}` : DEFAULT_TITLE

  nextTick(() => {
    document.title = title
  })
}
