<script setup lang="ts">
import usePWA from '@/composables/usePWA'
import { useDisplay } from 'vuetify'

const { platform, name, thresholds, width, height } = useDisplay()
const { canBeInstalled, isInstalled } = usePWA()
</script>

<template>
  <h1 class="mb-5">Debug Information</h1>

  <div class="d-flex flex-wrap ga-2">
    <v-card title="Screen and Platform">
      <v-card-text>
        <dl>
          <dt>Plattform</dt>
          <dd>
            <v-badge
              v-for="[tag, value] in Object.entries(platform)"
              :key="tag"
              inline
              :content="tag"
              :color="value ? 'success' : undefined"
            ></v-badge>
          </dd>
          <dt>Screen Breakpoint</dt>
          <dd>{{ name }}</dd>
          <dt>Screen Breakpoint Thresholds</dt>
          <dd>
            <v-badge
              v-for="[tag, value] in Object.entries(thresholds)"
              :key="tag"
              inline
              :content="`${tag}: >${value}px`"
              :color="tag === name ? 'success' : undefined"
            ></v-badge>
          </dd>
          <dt>Screen Size in px (width x height)</dt>
          <dd>{{ width }} x {{ height }}</dd>
        </dl>
      </v-card-text>
    </v-card>

    <v-card title="Progressive Web App">
      <v-card-text>
        <dl>
          <dt>Can be installed?</dt>
          <dd>{{ canBeInstalled }}</dd>
          <dt>Is installed?</dt>
          <dd>{{ isInstalled }}</dd>
        </dl>
      </v-card-text>
    </v-card>
  </div>
</template>

<style lang="css" scoped>
dl > dt {
  font-weight: bold;
}
dl > dd {
  margin-inline-start: 0.5rem;
}
dl > dd + dt {
  margin-top: 1rem;
}
</style>
