<template>
  <!-- The main app space. -->
  <v-app color="rgba(0, 0, 0, 1)">
    <!-- Layout will be rendered as part of the router view below -->
    <router-view />
  </v-app>
</template>

<script setup>
// Setup script
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app.js";

const appStore = useAppStore();
const { locale } = useI18n({ useScope: "global" });

onMounted(() => {
  // Check our locale settings
  if (appStore.localeOverride) {
    locale.value = appStore.localeOverride;
  }
});
</script>
<style lang="scss">
// Set the font family for the application to Share Tech Mono
.v-application {
  [class*="text-"] {
    font-family: "Share Tech Mono", sans-serif !important;
    font-display: swap;
  }

  font-family: "Share Tech Mono", sans-serif !important;
  font-display: swap;
}
</style>
