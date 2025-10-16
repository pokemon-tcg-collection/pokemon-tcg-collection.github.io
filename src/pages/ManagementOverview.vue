<script setup lang="ts">
import OverviewLinkCard from '@/components/OverviewLinkCard.vue'
import OverviewLinkCardContainer from '@/components/OverviewLinkCardContainer.vue'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const wipStore = useWorkInProgressStore()
</script>

<template>
  <h1 class="mb-3">Managment Dashboard</h1>

  <OverviewLinkCardContainer>
    <OverviewLinkCard
      v-if="wipStore.objects.size > 0"
      icon="mdi-database"
      title="Work in Progress"
      :to="{ name: 'wip' }"
      to-label="Finish edits"
    >
      List of work-in-progress objects.
    </OverviewLinkCard>
    <OverviewLinkCard
      icon="mdi-tune"
      title="Settings"
      :to="{ name: 'settings' }"
      to-label="Application settings"
    >
      Configure global app settings.
    </OverviewLinkCard>
    <OverviewLinkCard
      icon="mdi-database"
      title="Database"
      :to="{ name: 'database' }"
      to-label="Export/Import database"
    >
      Export, import, or delete the database.
    </OverviewLinkCard>
    <OverviewLinkCard
      icon="mdi-api"
      title="TCGDex API"
      :to="{ name: 'tcgdex' }"
      to-label="Go to TCGDex API"
    >
      TCGDex API settings, actions etc.
    </OverviewLinkCard>
    <OverviewLinkCard
      icon="mdi-script-text"
      title="Audit Log"
      :to="{ name: 'audit' }"
      to-label="See Audit Log"
    >
      Check app events.
    </OverviewLinkCard>
  </OverviewLinkCardContainer>
</template>
