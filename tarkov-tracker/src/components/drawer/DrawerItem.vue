<template>
  <v-list-item
    :class="itemClass"
    :to="props.to"
    :active="props.to === $route.path"
    @click="visitHref()"
  >
    <template v-if="props.avatar">
      <v-avatar size="24">
        <v-img :src="props.avatar" />
      </v-avatar>
    </template>
    <template v-else>
      <v-icon :icon="props.icon" />
    </template>
    <v-list-item-title
      v-if="!appStore.drawerUseRail(mdAndDown)"
      :class="titleClass"
      style="display: inline-flex"
    >
      <template v-if="props.localeKey">
        {{ $t(`navigation_drawer.${props.localeKey}`) }}
      </template>
      <template v-else-if="props.text">
        {{ props.text }}
      </template>
    </v-list-item-title>
  </v-list-item>
</template>

<script setup>
import { computed } from "vue";
import { useAppStore } from "@/stores/app.js";
import { useDisplay } from "vuetify";
const { mdAndDown } = useDisplay();

const props = defineProps({
  icon: {
    type: String,
    default: "mdi-menu-right",
    required: false,
  },
  avatar: {
    type: String,
    required: false,
    default: null,
  },
  localeKey: {
    type: String,
    required: false,
    default: null,
  },
  text: {
    type: String,
    required: false,
    default: null,
  },
  to: {
    type: String,
    required: false,
    default: null,
  },
  href: {
    type: String,
    required: false,
    default: null,
  },
});

const visitHref = () => {
  if (props.href !== null) {
    window.open(props.href, "_blank");
  }
};

const appStore = useAppStore();

const itemClass = computed(() => ({
  "align-center": appStore.drawerUseRail(mdAndDown.value),
  "justify-center": appStore.drawerUseRail(mdAndDown.value),
}));

const titleClass = computed(() => ({
  "v-drawer-item-full": !appStore.drawerUseRail(mdAndDown.value),
  "v-drawer-item-rail": appStore.drawerUseRail(mdAndDown.value),
}));
</script>
<style lang="scss" scoped>
// Set up styles for rail and standard item
.v-drawer-item-full {
  margin-inline-start: 32px;
}

.v-drawer-item-rail {
  width: 26px;
}
</style>
