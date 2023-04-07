<template>
  <v-alert color="orange" theme="dark" border prominent class="mx-4 mt-2">
    This is a complete rebuild of TarkovTracker. There are a few features from the old version which weren't quite
    finished before wipe. They will be added back in a day or two. Task and hideout data for 0.13 is being updated
    automatically as changes are discovered and verified. Feel free to report any issues you find in the Discord.
  </v-alert>
  <tracker-tip tip="welcomett3"></tracker-tip>

  <v-container class="mt-2">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <tracker-stat icon="mdi-progress-check">
          <template #stat>
            {{ $t('page.dashboard.stats.allTasks.stat') }}
          </template>
          <template #value>
            {{ completedTasks }}/{{ totalTasks }}
          </template>
          <template #details>
            {{ $t('page.dashboard.stats.allTasks.details') }}
          </template>
        </tracker-stat>
      </v-col>
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <tracker-stat icon="mdi-briefcase-search">
          <template #stat>
            {{ $t('page.dashboard.stats.allObjectives.stat') }}
          </template>
          <template #value>
            {{ completedObjectives }}/{{ totalObjectives }}
          </template>
          <template #details>
            {{ $t('page.dashboard.stats.allObjectives.details') }}
          </template>
        </tracker-stat>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { inject, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
import { useProgressStore } from '@/stores/progress'
import { useTarkovStore } from "@/stores/tarkov.js";
const TrackerStat = defineAsyncComponent(() =>
  import("@/components/TrackerStat.vue")
)
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
)

const { tasks, objectives } = useTarkovData()
const progressStore = useProgressStore()
const tarkovStore = useTarkovStore()
const totalTasks = computed(() => { return tasks.value?.length })

const totalObjectives = computed(() => { return objectives.value?.length })

 const completedObjectives = computed(() => {
  return objectives.value.filter(objective => tarkovStore.isTaskObjectiveComplete(objective.id)).length
})

const completedTasks = computed(() => {
  return Object.values(progressStore.tasksCompletions).filter((task) => task.self === true).length
})

</script>
<style lang="scss" scoped>

</style>
