<script setup lang="ts">
import { useDevicePixelRatio, useDevicesList, useNetwork } from '@vueuse/core'
import { useDisplay } from 'vuetify'

import usePWA from '@/composables/usePWA'

const { platform, name, thresholds, width, height } = useDisplay()
const { pixelRatio } = useDevicePixelRatio()
const {
  isSupported: isNetworkSupported,
  isOnline,
  saveData,
  type: networkType,
  effectiveType: effectiveNetworkType,
} = useNetwork()
const { videoInputs, ensurePermissions, permissionGranted } = useDevicesList({
  constraints: { video: true, audio: false },
  requestPermissions: false,
})
const { canBeInstalled, isInstalled } = usePWA()
</script>

<template>
  <h1 class="mb-5">Debug Information</h1>

  <div class="d-flex flex-wrap ga-2">
    <v-card title="Screen and Platform" prepend-icon="mdi-monitor-cellphone">
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
              :color="tag === name ? 'success' : value <= width ? 'yellow' : undefined"
            ></v-badge>
          </dd>
          <dt>Screen Size in px (width x height)</dt>
          <dd>{{ width }} x {{ height }}</dd>
          <dt>Device Pixel Ratio</dt>
          <dd>{{ pixelRatio }}</dd>
        </dl>
      </v-card-text>
    </v-card>

    <v-card
      title="Progressive Web App"
      prepend-icon="mdi-view-grid"
      v-if="canBeInstalled || isInstalled"
    >
      <v-card-text>
        <dl>
          <dt>Can be installed?</dt>
          <dd>{{ canBeInstalled }}</dd>
          <dt>Is installed?</dt>
          <dd>{{ isInstalled }}</dd>
        </dl>
      </v-card-text>
    </v-card>

    <v-card title="Network status" prepend-icon="mdi-wifi" v-if="isNetworkSupported">
      <v-card-text>
        <dl>
          <dt>Is online?</dt>
          <dd>{{ isOnline }}</dd>
          <dt>Is <i>Data Saver Mode</i> activated?</dt>
          <dd>{{ saveData }}</dd>
          <dt>Connection/Network type</dt>
          <dd>{{ networkType ?? 'unknown' }}</dd>
          <dt>Detected effective speed type</dt>
          <dd>{{ effectiveNetworkType }}</dd>
        </dl>
      </v-card-text>
    </v-card>

    <v-card title="Devices: Camera" prepend-icon="mdi-camera-iris" class="d-flex flex-column">
      <v-card-text>
        <dl>
          <dt>Permission granted?</dt>
          <dd>{{ permissionGranted }}</dd>
          <dt>Devices</dt>
          <li v-for="(videoInput, idx) in videoInputs" :key="idx">
            {{ videoInput.label || '?' }} [{{ videoInput.kind }}]
            <span
              class="d-inline-block text-no-wrap text-truncate text-grey-lighten-1"
              :style="{ 'max-width': '5rem', 'vertical-align': 'bottom' }"
              >{{ videoInput.deviceId || '?' }}</span
            >
          </li>
        </dl>
      </v-card-text>
      <v-card-actions v-if="!permissionGranted">
        <v-btn @click="ensurePermissions">Request permission</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style lang="css" scoped>
dl > dt {
  font-weight: bold;
}
dl > dd,
dl > li {
  margin-inline-start: 0.5rem;
}
dl > li {
  list-style-position: inside;
}
dl > dd + dt {
  margin-top: 1rem;
}
</style>
