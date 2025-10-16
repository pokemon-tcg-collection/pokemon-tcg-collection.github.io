<script lang="ts">
import { Fragment, type Slot, type VNode } from 'vue'
import { useDisplay } from 'vuetify'

// credit: https://github.com/orgs/vuejs/discussions/9414#discussion-5742965
function getSlotChildren(slot: Slot | undefined): VNode[] {
  return unwrapChildren(slot?.() || [])
}
function unwrapChildren(rawChildren: VNode[]) {
  const children = [] as VNode[]
  rawChildren.forEach((child) => {
    // console.debug(child.type, child.type === Comment)
    // components that are hidden via v-if end up as a Comment <!--v-if--> so we skip over them
    if (child.type === Comment) return

    // if the child is a template with a v-for, we actually want to get all of its children
    if (child.type === Fragment) {
      children.push(...unwrapChildren(child.children as VNode[]))
    } else {
      children.push(child)
    }
  })
  return children as VNode[]
}

export default {
  setup(_props, ctx) {
    const { mdAndUp } = useDisplay()

    // console.debug('setup', props, ctx)
    const children = getSlotChildren(ctx.slots.default)
    // console.debug('children', children)
    const wrappedChildren = [] as VNode[]
    for (const child of children) {
      // console.debug('child', child)
      const childType = (child.type as { __name?: string }).__name
      if (childType !== 'OverviewLinkCard') {
        // NOTE: conditional nodes (v-if) will also create some artificial nodes we might want to suppress
        console.warn("Child must only be of type 'OverviewLinkCard'!")
        if (mdAndUp.value) continue
      }
      wrappedChildren.push(child)
    }

    return { mdAndUp, linkCards: wrappedChildren }
  },
}
</script>

<template>
  <v-row v-if="mdAndUp">
    <v-col v-for="(card, i) in linkCards" :key="i" cols="4" class="d-flex flex-column">
      <component :is="card"></component>
    </v-col>
  </v-row>
  <v-container v-else class="ga-5 d-flex flex-row flex-wrap">
    <template v-for="(card, i) in linkCards" :key="i">
      <component :is="card"></component>
    </template>
  </v-container>
</template>
