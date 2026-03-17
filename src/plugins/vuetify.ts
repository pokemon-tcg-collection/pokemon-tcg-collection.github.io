/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import '@/styles/main.scss'

import { VFileUpload } from 'vuetify/labs/VFileUpload'

// Composables
import { createVuetify } from 'vuetify'

// utils
import { getSeparator } from '@/utils/locale'

// TODO: check how we use/import MDI icons: https://vuetifyjs.com/en/features/icon-fonts/#mdi-js-svg

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'system',
  },
  components: {
    VFileUpload,
  },
  locale: {
    decimalSeparator: getSeparator(undefined, 'decimal'),
  },
})
