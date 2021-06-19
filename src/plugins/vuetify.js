// Vuetify Documentation https://vuetifyjs.com

import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import ripple from 'vuetify/lib/directives/ripple'
import colors from 'vuetify/lib/util/colors'
import localstore from '../store/localstore.js'

Vue.use(Vuetify, { directives: { ripple } })

const colorTheme = {
  primary: '#0A0A09',
  secondary: '#9A8866',
  accent: '#242F35',
  info: '#181817',
  success: '#242F35',
  warning: '#242F35',
  error: '#FF0000',
  failure: '#540000',
}

const themeLight = {
  ...colorTheme,
  bgdarken: colors.grey.lighten4,
  enough: colors.blue.lighten4,
  questlink: colors.grey.darken4,
  objectivecomplete: '#e6ffe6',
  objectiveuncomplete: '#ffcccc',
  objectiveenough: '#d6ebff',
  chartbase: '#bbbbbb',
  sitebackground: '#eeeeee',
}

const themeDark = {
  ...colorTheme,
  bgdarken: colors.grey.darken4,
  background: 'var(--v-primary-base)',
  enough: '#001638',
  questlink: colors.grey.lighten4,
  objectivecomplete: '#114200',
  objectiveuncomplete: '#520000',
  objectiveenough: '#2e455a',
  chartbase: '#ffffff',
  sitebackground: '#121212',
}

export default new Vuetify({
  breakpoint: { mobileBreakpoint: 960 },
  icons: {
    values: { expand: 'mdi-menu-down' },
  },
  theme: {
    dark: localstore.get('app/dark'),
    options: { customProperties: true },
    themes: {
      dark: themeDark,
      light: themeLight,
    },
  },
})
