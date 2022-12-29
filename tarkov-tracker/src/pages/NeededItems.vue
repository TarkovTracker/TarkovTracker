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
    <v-row justify="center">
      <v-col cols="12" sm="12" md="8" lg="6">
        <v-text-field v-model="itemFilterNameText" label="Search by item name" variant="solo"></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <needed-item-card v-for="neededItem, itemIndex in neededQuestItems" :key="itemIndex" :need="neededItem"
        class="my-1" />
    </v-row>
  </v-container>
</template>
<script setup>
import { computed, provide, ref, watch } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
import { useProgressStore } from '@/stores/progress'
import { defineAsyncComponent } from 'vue'
import { debounce } from 'lodash-es'
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

const itemFilterNameText = ref('')
const itemFilterName = ref('')
provide('itemFilterName', itemFilterName)

watch(itemFilterNameText, debounce((newVal) => {
  itemFilterName.value = newVal
}, 500))

const neededQuestItems = computed(() => {
  return JSON.parse(JSON.stringify(neededItemTaskObjectives.value)).sort((a, b) => {
    let aCount = 0
    tasks.value.find((task) => task.id == a.taskId).predecessors.forEach((predecessor) => {
      // Check if the predecessor is completed
      if (progressStore.tasksCompletions?.[predecessor]?.['self'] === false) {
        aCount++
      }
    })

    let bCount = 0
    tasks.value.find((task) => task.id == b.taskId).predecessors.forEach((predecessor) => {
      // Check if the predecessor is completed
      if (progressStore.tasksCompletions?.[predecessor]?.['self'] === false) {
        bCount++
      }
    })
    if (aCount > bCount) {
      return 1
    } else if (aCount < bCount) {
      return -1
    }
    return 0
  })
})

</script>
<style lang="scss" scoped>

</style>