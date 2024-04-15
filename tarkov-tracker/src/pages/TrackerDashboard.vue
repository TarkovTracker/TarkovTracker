<template>
  <tracker-tip tip="welcomett3"></tracker-tip>

  <v-container class="mt-2">
    <v-alert density="compact" color="green-darken-4" title="Wipe Update">Escape From Tarkov 0.14.0.0 is here - Changes to
      quests and
      hideout upgrades will be pulled automatically
      from <a href='http://tarkov.dev/'>tarkov.dev</a> as they are discovered and confirmed.
    </v-alert>
    <v-alert density="compact" type="success" title="Automatic Quest Completion" class="mt-3">Thanks to the
      wonderful folks over at <a href='http://tarkov.dev/'>tarkov.dev</a>, its easier than ever to keep your TarkovTracker
      progress up to date with your in-game progress. They've worked on a new open-source tool which watches the log files
      for the game for messages about quest completions. If you link a TarkovTracker API token with the tool, it can
      automatically mark off the quest for you via the free TarkovTracker API. Check out the project on <a
        href='https://github.com/the-hideout/TarkovMonitor' target="_blank">GitHub</a> and download it from the project's <a
        href='https://github.com/the-hideout/TarkovMonitor/releases/latest' target="_blank">Releases</a></v-alert>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <tracker-stat icon="mdi-progress-check">
          <template #stat>
            {{ $t("page.dashboard.stats.allTasks.stat") }}
          </template>
          <template #value> {{ completedTasks }}/{{ totalTasks }} ({{ ((completedTasks / totalTasks) * 100).toFixed(1) }}%)</template>
          <template #details>
            {{ $t("page.dashboard.stats.allTasks.details") }}
          </template>
        </tracker-stat>
      </v-col>
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <tracker-stat icon="mdi-briefcase-search">
          <template #stat>
            {{ $t("page.dashboard.stats.allObjectives.stat") }}
          </template>
          <template #value>
            {{ completedObjectives }}/{{ totalObjectives }} ({{ ((completedObjectives / totalObjectives) * 100).toFixed(1) }}%)
          </template>
          <template #details>
            {{ $t("page.dashboard.stats.allObjectives.details") }}
          </template>
        </tracker-stat>
      </v-col>
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <tracker-stat icon="mdi-briefcase-search">
          <template #stat>
            {{ $t("page.dashboard.stats.taskItems.stat") }}
          </template>
          <template #value>
            {{ completedTaskItems }}/{{ totalTaskItems }} ({{ ((completedTaskItems / totalTaskItems) * 100).toFixed(1) }}%)
          </template>
          <template #details>
            {{ $t("page.dashboard.stats.taskItems.details") }}
          </template>
        </tracker-stat>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { inject, computed } from "vue";
import { defineAsyncComponent } from "vue";
import { useTarkovData } from "@/composables/tarkovdata";
import { useProgressStore } from "@/stores/progress";
import { useTarkovStore } from "@/stores/tarkov.js";
const TrackerStat = defineAsyncComponent(() =>
  import("@/components/TrackerStat.vue")
);
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
);

const { tasks, objectives, neededItemTaskObjectives } = useTarkovData();
const progressStore = useProgressStore();
const tarkovStore = useTarkovStore();

const totalTasks = computed(() => {
  let relevantTasks = tasks.value.filter((task) => task.factionName == "Any" || task.factionName == tarkovStore.getPMCFaction).length;
  // Find all tasks with alternatives and subtract n-1 from the total
  let tasksWithAlternatives = tasks.value.filter((task) => task.alternatives.length > 0);
  // For each task with alternatives, subtract n-1 from the total and then remove the task and its alternatives from the list
  tasksWithAlternatives.forEach((task) => {
    relevantTasks -= task.alternatives.length - 1;
    task.alternatives.forEach((alternative) => {
      tasksWithAlternatives = tasksWithAlternatives.filter((task) => task.id != alternative);
    });
  });
  return relevantTasks;
});

const totalObjectives = computed(() => {
  let total = 0;
  tasks.value.filter((task) => task.factionName == "Any" || task.factionName == tarkovStore.getPMCFaction).forEach((task) => {
    total += task.objectives.length;
  });
  return total;
});

const completedObjectives = computed(() => {
  return objectives.value.filter((objective) =>
    tarkovStore.isTaskObjectiveComplete(objective.id)
  ).length;
});

const completedTasks = computed(() => {
  return Object.values(progressStore.tasksCompletions).filter(
    (task) => task.self === true
  ).length;
});

const completedTaskItems = computed(() => {
  let total = 0;
  neededItemTaskObjectives.value.forEach((objective) => {
    // If the objective is Dollars, Euros, or Rubles, skip it
    if (["5696686a4bdc2da3298b456a", "5449016a4bdc2d6f028b456f", "569668774bdc2da2298b4568"].includes(objective?.item?.id)) {
      return;
    }

    let relatedTask = tasks.value.find((task) => task.id === objective.taskId);
    if (relatedTask.factionName != "Any" && relatedTask.factionName != tarkovStore.getPMCFaction) {
      return;
    }

    // If the objective has a count, use that, otherwise assume 1
    if (progressStore.tasksCompletions[objective.taskId]["self"] ||
      progressStore.objectiveCompletions[objective.id]["self"] || objective?.count <= tarkovStore.getObjectiveCount(objective.id)) {
      total += objective.count || 1;
    } else {
      total += tarkovStore.getObjectiveCount(objective.id);
    }
  });
  return total;
})

const totalTaskItems = computed(() => {
  let total = 0;
  neededItemTaskObjectives.value.forEach((objective) => {
    // If the objective is Dollars, Euros, or Rubles, skip it
    if (["5696686a4bdc2da3298b456a", "5449016a4bdc2d6f028b456f", "569668774bdc2da2298b4568"].includes(objective?.item?.id)) {
      return;
    }

    let relatedTask = tasks.value.find((task) => task.id === objective.taskId);
    if (relatedTask.factionName != "Any" && relatedTask.factionName != tarkovStore.getPMCFaction) {
      return;
    }

    // If the objective has a count, use that, otherwise assume 1
    if (objective.count) {
      total += objective.count;
    } else {
      total += 1;
    }
  });
  return total;
});
</script>
<style lang="scss" scoped></style>
