<template>
  <tracker-tip tip="hideout"></tracker-tip>
  <v-container>
    <v-row justify="center" v-if="hideoutLoading">
      <v-col cols="12" align="center">
        <v-progress-circular indeterminate color="secondary" class="mx-2"></v-progress-circular> {{
            $t('page.hideout.loading')
        }}
      </v-col>
    </v-row>
    <v-row justify="center" class="mt-2">
      <v-col v-for="hStation, hIndex in progressStore.visibleStations" :key="hIndex" cols="12" sm="12" md="6" lg="6"
        xl="4">
        <hideout-card :station="hStation" class="ma-2" />
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
const HideoutCard = defineAsyncComponent(() =>
  import("@/components/hideout/HideoutCard.vue")
)
const { tasks, maps, traders, hideoutStations, hideoutLoading } = useTarkovData()
const progressStore = useProgressStore()

</script>
<style lang="scss" scoped>

</style>