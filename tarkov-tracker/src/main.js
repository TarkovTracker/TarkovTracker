import { createApp } from "vue";

import { DefaultApolloClient } from "@vue/apollo-composable";

// Router component
import router from "./router";

// Web font loader
import { loadFonts } from "./plugins/webfontloader";

// i18n
import i18n from "./plugins/i18n";

// Vuetify
import vuetify from "./plugins/vuetify";

// Pinia
import pinia from "./plugins/pinia";

// Apollo GraphQL client
import apolloClient from "./plugins/apollo";

// VueFire
import { VueFire, VueFireAuth } from "vuefire";
import { fireapp } from "./plugins/firebase";

// Base app component
import App from "./App.vue";

loadFonts();

createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .use(i18n)
  .use(VueFire, {
    firebaseApp: fireapp,
    modules: [VueFireAuth()],
  })
  .provide(DefaultApolloClient, apolloClient)
  .mount("#app");
