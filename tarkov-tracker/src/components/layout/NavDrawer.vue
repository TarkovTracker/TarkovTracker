<template>
  <v-navigation-drawer
    v-model="appStore.drawerShow"
    theme="dark"
    image="/img/sidebar-background.webp"
    :rail="appStore.drawerUseRail(mdAndDown)"
  >
    <tracker-logo />
    <v-divider class="mx-3 my-1" />
    <drawer-account />
    <v-divider class="mx-3 my-1" />
    <drawer-level />
    <v-divider class="mx-3 my-1" />
    <drawer-links />
    <v-divider class="mx-3 my-1" />
    <drawer-external-links />
  </v-navigation-drawer>
</template>
<script setup>
import { defineAsyncComponent } from "vue";
import { useAppStore } from "@/stores/app.js";

import { useDisplay } from "vuetify";
const { mdAndDown } = useDisplay();

const appStore = useAppStore();

// Set up component loading
const TrackerLogo = defineAsyncComponent(() =>
  import("@/components/drawer/TrackerLogo.vue")
);
const DrawerLinks = defineAsyncComponent(() =>
  import("@/components/drawer/DrawerLinks.vue")
);
const DrawerAccount = defineAsyncComponent(() =>
  import("@/components/drawer/DrawerAccount.vue")
);
const DrawerLevel = defineAsyncComponent(() =>
  import("@/components/drawer/DrawerLevel.vue")
);
const DrawerExternalLinks = defineAsyncComponent(() =>
  import("@/components/drawer/DrawerExternalLinks.vue")
);
</script>
<style lang="scss" scoped>
:deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 0 !important;
  padding-left: 8px !important;
}
</style>
