<template>
  <v-list-item
    id="app-logo-item"
    class="flex flex-column mt-1"
    :ripple="false"
    to="/"
  >
    <div
      :class="appStore.drawerUseRail(mdAndDown) ? 'v-logo-rail' : 'v-logo-full'"
      style="height: auto; margin: 20px auto"
    >
      <v-img :src="logo" lazy-src="/favicon-32x32.png" />
    </div>
    <div v-if="!appStore.drawerUseRail(mdAndDown)">
      <div class="text-h5 text-center mt-2 font-weight-medium">
        {{ $t("site_name") }}
      </div>
    </div>
  </v-list-item>
</template>

<script setup>
import { computed } from "vue";
import { useAppStore } from "@/stores/app.js";
import { useDisplay } from "vuetify";
const { mdAndDown } = useDisplay();
const appStore = useAppStore();

const logo = computed(() => {
  return appStore.drawerUseRail(mdAndDown.value)
    ? "/img/tarkovtrackerlogo-mini.png"
    : "/img/tarkovtrackerlogo-light.png";
});
</script>
<style lang="scss" scoped>
// Set up styles for rail and standard logo
// We set global for this because we need to inject into multiple layers of components
:global(#app-logo-item > .v-list-item__overlay) {
  opacity: 0 !important;
}

// We set deep for this so that it is carried down into child componets (vuetify components)
:deep(.v-logo-full) {
  width: 85%;
  min-width: 80%;
}

// We set deep for this so that it is carried down into child componets (vuetify components)
:deep(.v-logo-rail) {
  width: 32x;
}
</style>
