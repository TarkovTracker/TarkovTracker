<template>
    <div class="d-flex justify-center align-center mb-2">
    <span v-if="!appStore.drawerUseRail(mdAndDown)" style="line-height:0px" >
      <img
        :src="groupIcon"
        contain
        style="max-width:64px"
      >
    </span>
    <span>
      <div style="font-size:.7em" class="text-center mb-1">
        {{ $t('navigation_drawer.level') }}
      </div>
      <div class="text-center">
        <h1 style="font-size:2.5em; line-height:0.8em;">
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
          <v-icon class="ma-0" small>
            mdi-chevron-up
          </v-icon>
        </v-btn>
      </div>
      <div>
        <v-btn
          icon
          size="small"
          variant="plain"
          @click="tarkovStore.decrementLevel()"
        >
          <v-icon class="ma-0" small>
            mdi-chevron-down
          </v-icon>
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
import { computed } from 'vue'
import { useTarkovStore } from "@/stores/tarkov.js";
import { useAppStore } from "@/stores/app.js";
import { useDisplay } from 'vuetify'
const { mdAndDown } = useDisplay()
const tarkovStore = useTarkovStore();
const appStore = useAppStore();

const groupIcon = computed(() => { return `/img/levelgroups/${Math.floor(tarkovStore.value.playerLevel / 5) + 1}.png`})

</script>
<style lang="scss" scoped>
.fake-link {
  cursor: pointer;
}
</style>