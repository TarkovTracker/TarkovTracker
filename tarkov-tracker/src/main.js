import { createApp } from 'vue'

import { DefaultApolloClient } from '@vue/apollo-composable'

// Router component
import router from './router'

// Web font loader
import { loadFonts } from './plugins/webfontloader'

// i18n
import i18n from './plugins/i18n'

// Vuetify
import vuetify from './plugins/vuetify'

// Pinia
import pinia from './plugins/pinia'

// Apollo GraphQL client
import apolloClient from './plugins/apollo'

// tarkovdata
import { TarkovDataPlugin } from './plugins/tarkovdata'

// Base app component
import App from './App.vue'

loadFonts()

createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .use(i18n)
  .use(TarkovDataPlugin)
  .provide(DefaultApolloClient, apolloClient)
  .mount('#app')
