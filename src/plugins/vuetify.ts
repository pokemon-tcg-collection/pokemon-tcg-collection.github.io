/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles

// https://vuetifyjs.com/en/getting-started/installation/#option-a-2014-install-via-40fontsource-roboto
// import '@fontsource/roboto'
import '@fontsource/roboto/400.css' // default text
import '@fontsource/roboto/500.css' // bold text
import '@fontsource/roboto/700.css' // bold headings
import '@fontsource/roboto/400-italic.css' // default italics text
// 100, 300, 400, 500, 700, 900; normal, italic

import '@mdi/font/css/materialdesignicons.css'
import '@/styles/main.scss'

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
  defaults: {
    VHighlight: {
      matchAll: true,
      ignoreCase: true,
      ignoreAccents: true,
    },
  },
  locale: {
    decimalSeparator: getSeparator(undefined, 'decimal'),
  },
})
