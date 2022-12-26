<template>
  <tracker-tip tip="hideout"></tracker-tip>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <span v-for="hModule, builtIndex in progressStore.availableModules" :key="builtIndex">{{ hModule }}</span>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
import { useProgressStore } from '@/stores/progress'
import { defineAsyncComponent } from 'vue'
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
)
const { tasks, maps, traders, hideoutStations } = useTarkovData()
const progressStore = useProgressStore()

</script>
<style lang="scss" scoped>

</style>