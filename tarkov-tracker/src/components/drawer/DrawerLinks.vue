<template>
  <v-list nav bg-color="transparent" class="mx-auto">
    <drawer-item icon="mdi-view-dashboard" locale-key="home" to="/">
    </drawer-item>
    <drawer-item
      icon="mdi-clipboard-text-multiple"
      locale-key="tasks"
      to="/tasks"
    >
    </drawer-item>
    <drawer-item icon="mdi-list-box" locale-key="neededitems" to="/items">
    </drawer-item>
    <drawer-item icon="mdi-home" locale-key="hideout" to="/hideout">
    </drawer-item>
    <drawer-item
      v-show="fireuser.loggedIn"
      icon="mdi-account-group"
      locale-key="team"
      to="/team"
    >
    </drawer-item>
    <drawer-item icon="mdi-cog" locale-key="settings" to="/settings">
    </drawer-item>
  </v-list>
</template>
<script setup>
import { defineAsyncComponent } from "vue";
import { fireuser } from "@/plugins/firebase";
const DrawerItem = defineAsyncComponent(() =>
  import("@/components/drawer/DrawerItem.vue")
);
</script>
<style lang="scss" scoped></style>
