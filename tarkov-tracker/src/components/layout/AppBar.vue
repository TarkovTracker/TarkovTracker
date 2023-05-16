<template>
  <v-app-bar color="transparent" prominent elevation="0">
    <template #image>
      <v-img
        gradient="to top right, rgba(45,45,35,.95), rgba(6,13,12,.95)"
      ></v-img>
    </template>
    <template #prepend>
      <v-app-bar-nav-icon
        :icon="navBarIcon"
        variant="text"
        aria-label="Toggle Menu Drawer"
        @click.stop="changeNavigationDrawer"
      ></v-app-bar-nav-icon>
    </template>

    <v-toolbar-title>{{ $t(`page.${route.name}.title`) }}</v-toolbar-title>

    <span v-if="dataError">
      <!-- Show an icon and tooltip if we have a GraphQL error -->
      <v-tooltip activator="parent" location="left">
        Error Loading Tarkov Data
        <template #activator="{ props }">
          <v-icon v-bind="props" class="mx-auto"> mdi-database-alert </v-icon>
        </template>
      </v-tooltip>
    </span>
    <span v-if="dataLoading || hideoutLoading">
      <!-- Show an icon and tooltip while we load the GraphQL result -->
      <v-tooltip activator="parent" location="left">
        Loading Tarkov Data
        <template #activator="{ props }">
          <v-progress-circular
            v-bind="props"
            indeterminate
            color="secondary"
            class="mx-2"
          ></v-progress-circular>
        </template>
      </v-tooltip>
    </span>
    <template #append>
      <v-menu
        v-model="state.menu"
        :close-on-content-click="false"
        location="start"
      >
        <template #activator="{ props }">
          <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
        </template>
        <overflow-menu />
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script setup>
import { computed } from "vue";
import { defineAsyncComponent, inject } from "vue";
import { useAppStore } from "@/stores/app.js";
import { useDisplay } from "vuetify";
import { useRoute } from "vue-router";
import { reactive } from "vue";
import { useTarkovData } from "@/composables/tarkovdata.js";

const state = reactive({ menu: null });

const appStore = useAppStore();

const route = useRoute();

const navBarIcon = computed(() => {
  return appStore.drawerShow && appStore.drawerRail
    ? "mdi-menu-open"
    : "mdi-menu";
});

const OverflowMenu = defineAsyncComponent(() =>
  import("/src/components/layout/OverflowMenu.vue")
);

const {
  loading: dataLoading,
  error: dataError,
  hideoutLoading,
} = useTarkovData();

// Change how the navigation bar is modified based upon the screen size
// Either change between open/close or rail/full
const { mdAndDown } = useDisplay();
function changeNavigationDrawer() {
  if (mdAndDown.value) {
    appStore.drawerShow = !appStore.drawerShow;
  } else {
    appStore.drawerRail = !appStore.drawerRail;
  }
}
</script>
