<template>
  <v-alert color="red" theme="dark" border prominent class="mx-4 mt-2">
    Wipe was announced while this page was being finished. It will be updated with extra sorting, filtering, layout
    improvements and team
    data in the next 24 hours. Some quests are expected to change, but the needed items will probably stay mostly the
    same. Quantities and new items will be updated as soon as we have the data. Updating item progression will carry
    into whatever changes are made to quests.
  </v-alert>
  <tracker-tip tip="neededitems"></tracker-tip>
  <v-container>
    <v-row v-if="loading || hideoutLoading" justify="center">
      <v-col cols="12" align="center">
        <v-progress-circular indeterminate color="secondary" class="mx-2"></v-progress-circular> {{
    $t('page.neededitems.loading')
}} <refresh-button />
      </v-col>
    </v-row>
    <v-row>
      <needed-item-card v-for="neededItem, itemIndex in neededItemTaskObjectives" :key="itemIndex" :need="neededItem"
        class="my-1" />
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
const RefreshButton = defineAsyncComponent(() =>
  import("@/components/RefreshButton.vue")
)
const NeededItemCard = defineAsyncComponent(() =>
  import("@/components/neededitems/NeededItemCard.vue")
)
const { tasks, maps, traders, hideoutStations, hideoutLoading, loading, neededItemTaskObjectives, neededItemHideoutModules } = useTarkovData()
const progressStore = useProgressStore()

const neededQuestItems = computed(() => {
  return progressStore.neededQuestItems
})

</script>
<style lang="scss" scoped>

</style>