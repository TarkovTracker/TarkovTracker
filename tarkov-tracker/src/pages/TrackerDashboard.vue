<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        sm="8"
        md="6"
        lg="4"
        xl="3"
      >
        <tracker-stat icon="mdi-progress-check">
          <template #stat>
            {{ $t('page.dashboard.stats.allQuests.stat') }}
          </template>
          <template #value>
            0/{{ totalQuests }}
          </template>
          <template #details>
            {{ $t('page.dashboard.stats.allQuests.details') }}
          </template>
        </tracker-stat>
      </v-col>
      <v-col
        cols="12"
        sm="8"
        md="6"
        lg="4"
        xl="3"
      >
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
const TrackerStat = defineAsyncComponent(() =>
  import("@/components/TrackerStat.vue")
)

const { tasks, objectives } = inject('tarkov-data')
const totalQuests = computed(() => { return tasks.value?.length })

const totalObjectives = computed(() => { return objectives.value?.length })

</script>
<style lang="scss" scoped>
</style>