<template>
  <div class="d-flex justify-center align-center mb-2">
    <span v-if="!appStore.drawerUseRail(mdAndDown)" style="line-height: 0px">
      <div class="crossfade">
        <img
          :src="pmcFactionIcon"
          style="max-width: 64px"
          class="px-2 faction-icon crossfade-faction"
        />
        <img :src="groupIcon" style="max-width: 64px" class="crossfade-level" />
      </div>
    </span>
    <span>
      <div style="font-size: 0.7em" class="text-center mb-1">
        {{ $t("navigation_drawer.level") }}
      </div>
      <div class="text-center">
        <h1 style="font-size: 2.5em; line-height: 0.8em">
          {{ tarkovStore.playerLevel }}
        </h1>
      </div>
    </span>
    <span v-if="!appStore.drawerUseRail(mdAndDown)">
      <div>
        <v-btn
          icon
          size="small"
          variant="plain"
          @click="tarkovStore.incrementLevel()"
        >
          <v-icon class="ma-0" small> mdi-chevron-up </v-icon>
        </v-btn>
      </div>
      <div>
        <v-btn
          icon
          size="small"
          variant="plain"
          @click="tarkovStore.decrementLevel()"
        >
          <v-icon class="ma-0" small> mdi-chevron-down </v-icon>
        </v-btn>
      </div>
    </span>
  </div>
  <!-- <template v-if="appStore.drawerUseRail(mdAndDown)">
      
    </template>
    <template v-else>
      {{ tarkovStore.storeSelected }}
    </template> -->
</template>
<script setup>
import { computed } from "vue";
import { useTarkovStore } from "@/stores/tarkov.js";
import { useAppStore } from "@/stores/app.js";
import { useDisplay } from "vuetify";
const { mdAndDown } = useDisplay();
const tarkovStore = useTarkovStore();
const appStore = useAppStore();

const pmcFactionIcon = computed(() => {
  return `/img/factions/${tarkovStore.getPMCFaction}.webp`;
});

const groupIcon = computed(() => {
  return `/img/levelgroups/${Math.floor(tarkovStore.playerLevel / 5) + 1}.png`;
});
</script>
<style lang="scss" scoped>
.faction-icon {
  filter: invert(1);
}

.crossfade {
  position: relative;
  width: 64px;
  height: 64px;
  overflow: hidden;
}

.crossfade-faction {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  opacity: 0;
  margin-top: 8px;
  transition: opacity 1s ease-in-out;
}

.crossfade-level {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  opacity: 1;
  transition: opacity 1s ease-in-out;
}

.crossfade:hover .crossfade-faction {
  opacity: 1;
}

.crossfade:hover .crossfade-level {
  opacity: 0;
}
</style>
