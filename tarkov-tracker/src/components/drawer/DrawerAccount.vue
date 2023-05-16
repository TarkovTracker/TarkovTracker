<template>
  <v-list nav bg-color="transparent" class="mx-auto">
    <template v-if="fireuser.loggedIn">
      <v-list-group>
        <template #activator="{ props }">
          <template v-if="appStore.drawerUseRail(mdAndDown)">
            <v-avatar
              v-bind="props"
              class="mx-auto"
              size="24"
              :class="
                appStore.drawerUseRail(mdAndDown) ? 'd-flex fake-link' : ''
              "
            >
              <v-img :src="fireuser.photoURL" />
            </v-avatar>
          </template>
          <template v-else>
            <v-list-item
              v-bind="props"
              :title="fireuser.displayName"
              :prepend-avatar="fireuser.photoURL"
            ></v-list-item>
          </template>
        </template>
        <drawer-item icon="mdi-lock" locale-key="logout" @click.stop="logout" />
      </v-list-group>
    </template>
    <template v-else>
      <drawer-item icon="mdi-fingerprint" locale-key="login" to="/login" />
    </template>
  </v-list>
</template>
<script setup>
import { fireapp, fireuser } from "@/plugins/firebase";
import { defineAsyncComponent } from "vue";
import { useAppStore } from "@/stores/app.js";
import { useDisplay } from "vuetify";
const { mdAndDown } = useDisplay();
const appStore = useAppStore();

const DrawerItem = defineAsyncComponent(() =>
  import("@/components/drawer/DrawerItem.vue")
);

function logout() {
  fireapp.auth().signOut();
}
</script>
<style lang="scss" scoped>
:global(body
    > div.v-overlay-container
    > div.allow-overflow
    > div.v-overlay__content
    > div.v-sheet) {
  overflow-y: visible;
}

.fake-link {
  cursor: pointer;
}
</style>
