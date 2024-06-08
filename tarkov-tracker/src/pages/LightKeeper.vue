<template>
  <tracker-tip tip="lightkeeper"></tracker-tip>

  <v-container>
    <v-row justify="center">
      <v-col lg="4" md="12">
        <v-card>
          <v-tabs
            v-model="activePrimaryView"
            bg-color="accent"
            slider-color="secondary"
            align-tabs="center"
            show-arrows
          >
            <v-tab
              v-for="(view, index) in primaryViews"
              :key="index"
              :value="view.view"
              :prepend-icon="view.icon"
            >
              {{ view.title }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
      <v-col lg="6" md="12">
        <v-card class="h-100 d-flex align-center pl-4">
          {{ $t("page.lightkeeper.total_remaining") }}:
          {{ totalTasksRemaining }}
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-container v-if="loadingTasks || reloadingTasks">
    <!-- If we're still waiting on tasks from tarkov.dev API -->
    <v-progress-circular
      indeterminate
      color="secondary"
      class="mx-2"
    ></v-progress-circular>
    {{ $t("page.tasks.loading") }}
    <refresh-button />
  </v-container>
  <v-container v-if="!loadingTasks && !reloadingTasks">
    <v-alert v-if="visibleTasks.length == 0" icon="mdi-clipboard-search">
      {{ $t("page.tasks.notasksfound") }}
    </v-alert>
    <v-lazy
      v-for="(task, taskIndex) in visibleTasks"
      :key="taskIndex"
      :options="{
        threshold: 0.5,
      }"
      min-height="100"
    >
      <task-card :task="task" class="my-1" />
    </v-lazy>
  </v-container>
</template>
<script setup>
import { defineAsyncComponent, computed, watch, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useTarkovData } from "@/composables/tarkovdata";
import { useProgressStore } from "@/stores/progress";

const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
);
const TaskCard = defineAsyncComponent(() =>
  import("@/components/tasks/TaskCard.vue")
);
const RefreshButton = defineAsyncComponent(() =>
  import("@/components/RefreshButton.vue")
);
const { t } = useI18n({ useScope: "global" });
const progressStore = useProgressStore();

const VIEW_ALL = "all";
const VIEW_AVAILABLE = "available";
const primaryViews = [
  {
    title: t("page.lightkeeper.primaryviews.all"),
    icon: "mdi-clipboard-check",
    view: VIEW_ALL,
  },
  {
    title: t("page.lightkeeper.primaryviews.available"),
    icon: "mdi-clipboard-text",
    view: VIEW_AVAILABLE,
  },
];

const activePrimaryView = ref({});

const { tasks, loading: tasksLoading } = useTarkovData();

const loadingTasks = computed(() => {
  return tasksLoading.value;
});
const reloadingTasks = ref(true);

const visibleTasks = shallowRef([]);
const totalTasksRemaining = ref(0);

const updateVisibleTasks = async function () {
  console.log("Tasks updating (" + activePrimaryView.value + ")...");

  let fullTaskList = JSON.parse(JSON.stringify(tasks.value));

  let lightkeeperTasks = [];
  let numberOfTasksRemaining = 0;

  for (const task of fullTaskList) {
    if (!task.lightkeeperRequired) {
      continue;
    }
    if (progressStore.tasksCompletions[task.id].self) {
      continue;
    }

    // add up all relevant tasks which have not been completed yet
    numberOfTasksRemaining++;

    if (activePrimaryView.value == VIEW_AVAILABLE) {
      // if we are showing the available tasks, filter for unlockedTasks
      if (progressStore.unlockedTasks[task.id].self != true) {
        continue;
      }
    }

    lightkeeperTasks.push(task);
  }

  lightkeeperTasks.sort(
    (a, b) => a.predecessors.length - b.predecessors.length
  );

  /*
  for (const task of lightkeeperTasks) {
    console.log("Task:", task, progressStore.unlockedTasks[task.id]);
  }
  */

  reloadingTasks.value = false;
  visibleTasks.value = lightkeeperTasks;
  totalTasksRemaining.value = numberOfTasksRemaining;
};

// Watch for changes to the views, and update the visible tasks
watch(
  [activePrimaryView, tasks],
  async () => {
    reloadingTasks.value = true;
    await updateVisibleTasks();
  },
  { immediate: true }
);

watch(
  () => progressStore.tasksCompletions,
  async () => {
    reloadingTasks.value = true;
    await updateVisibleTasks();
  }
);
</script>
<style lang="scss" scoped></style>
