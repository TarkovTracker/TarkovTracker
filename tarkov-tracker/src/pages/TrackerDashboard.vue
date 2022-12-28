<template>
  <v-alert color="red" theme="dark" border prominent class="mx-4 mt-2">
    Wipe was just announced! This is a complete rebuild of TarkovTracker. There are a few pages that were in the middle
    of
    being rebuilt and are not fully complete. They should be so in the next 24 hours. Task, hideout, and item progress
    tracking should all work. API interactions with external tools like Tarkov.dev and RatScanner may be broken for a
    few hours. Data on new quests and quest changes will be loaded in as they are discovered and verified.
    Please let me know on Discord if you run into any bugs.
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
            0/{{ totalTasks }}
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
            0/{{ totalObjectives }}
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
const TrackerStat = defineAsyncComponent(() =>
  import("@/components/TrackerStat.vue")
)
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
)

const { tasks, objectives } = useTarkovData()
const totalTasks = computed(() => { return tasks.value?.length })

const totalObjectives = computed(() => { return objectives.value?.length })

</script>
<style lang="scss" scoped>

</style>