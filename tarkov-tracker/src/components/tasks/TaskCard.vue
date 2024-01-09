<template>
  <v-sheet
    :id="`task-${props.task.id}`"
    class="pa-2 taskContainer"
    :rounded="true"
    :class="{
      'task-complete': isComplete && !isFailed,
      'task-locked': isLocked || isFailed,
    }"
  >
    <div v-if="isLocked || isFailed" class="taskContainerBackground text-h1">
      <v-icon>mdi-lock</v-icon>
    </div>
    <div v-if="isComplete" class="taskContainerBackground text-h1">
      <v-icon>mdi-check</v-icon>
    </div>
    <v-container>
      <v-row>
        <v-col
          cols="12"
          xs="12"
          sm="4"
          md="3"
          lg="3"
          :align="xs ? 'center' : 'left'"
        >
          <!-- Quest general info, links, and tags -->
          <template v-if="!xs">
            <!-- Not xs, so display full details -->
            <v-container class="ma-0 pa-0">
              <v-row no-gutters class="mb-2" style="font-size: 1.1em">
                <v-col cols="12">
                  <task-link :task="props.task" />
                </v-col>
              </v-row>
              <v-row v-if="props.task.minPlayerLevel != 0" no-gutters>
                <v-col cols="auto" class="mr-1">
                  <v-icon icon="mdi-menu-right" />
                </v-col>
                <v-col>
                  <i18n-t keypath="page.tasks.questcard.level" scope="global">
                    <template #count>
                      {{ props.task.minPlayerLevel }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
              <v-row v-if="task?.predecessors?.length" no-gutters class="mb-1">
                <v-col cols="auto" class="mr-1">
                  <v-icon icon="mdi-lock-open-outline" />
                </v-col>
                <v-col>
                  <i18n-t
                    keypath="page.tasks.questcard.lockedbefore"
                    scope="global"
                  >
                    <template #count>
                      {{ lockedBefore }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
              <v-row v-if="task?.successors?.length" no-gutters class="mb-1">
                <v-col cols="auto" class="mr-1">
                  <v-icon icon="mdi-lock" />
                </v-col>
                <v-col>
                  <i18n-t
                    keypath="page.tasks.questcard.lockedbehind"
                    scope="global"
                  >
                    <template #count>
                      {{ lockedBehind }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
              <v-row v-if="task?.factionName != 'Any'" no-gutters class="mb-1">
                <v-col cols="auto" class="mr-1">
                  <img :src="factionImage" class="faction-icon mx-1" />
                </v-col>
                <v-col>
                  {{ task.factionName }}
                </v-col>
              </v-row>
              <v-row v-if="nonKappa" no-gutters class="mb-1">
                <v-col cols="auto" class="mr-1">
                  <v-chip size="x-small" color="red" variant="outlined">
                    {{ $t("page.tasks.questcard.nonkappa") }}
                  </v-chip>
                </v-col>
              </v-row>
              <v-row no-gutters class="mb-1">
                <a
                  :href="props.task.wikiLink"
                  target="_blank"
                  class="wiki-link"
                >
                  <v-row no-gutters>
                    <v-col cols="auto" class="mr-1">
                      <v-icon icon="mdi-information-outline" />
                    </v-col>
                    <v-col>
                      {{ $t("page.tasks.questcard.wiki") }}
                    </v-col>
                  </v-row>
                </a>
              </v-row>
            </v-container>
          </template>
          <template v-else>
            <!-- xs, so display only the name -->
            <task-link :task="props.task" class="d-flex justify-center" />
          </template>
        </v-col>
        <v-col
          cols="12"
          xs="12"
          sm="8"
          md="7"
          lg="7"
          class="d-flex align-center"
        >
          <v-container>
            <!-- Quest keys -->
            <v-row v-if="props.task?.neededKeys?.length > 0" no-gutters>
              <v-col cols="auto" class="py-1">
                <v-sheet class="pa-1 rounded-lg" color="accent">
                  <div
                    v-for="(keyMap, keyMapIndex) in props.task.neededKeys"
                    :key="keyMapIndex"
                    class="d-flex align-center my-1"
                  >
                    <i18n-t
                      keypath="page.tasks.questcard.keysneeded"
                      scope="global"
                      :plural="keyMap.keys.length"
                    >
                      <template #keys>
                        <span
                          v-for="(key, keyIndex) in keyMap.keys"
                          :key="keyIndex"
                          class="d-inline-block"
                        >
                          <tarkov-item
                            :item-id="key.id"
                            :item-name="key.shortName"
                            :dev-link="key.link"
                            :wiki-link="key.wikiLink"
                            class="mr-2"
                          />
                        </span>
                      </template>
                      <template #map>
                        {{ keyMap.map.name }}
                      </template>
                    </i18n-t>
                  </div>
                </v-sheet>
              </v-col>
            </v-row>
            <!-- Quest objectives -->
            <v-row no-gutters>
              <v-col
                v-for="(objective, objectiveIndex) in relevantViewObjectives"
                :key="objectiveIndex"
                cols="12"
                class="py-1"
              >
                <task-objective :objective="objective" />
              </v-col>
              <v-col
                v-if="
                  relevantViewObjectives.length != props.task.objectives.length
                "
                cols="12"
                class="pa-1 hidden-objectives"
              >
                <v-icon size="x-small" class="mr-1">mdi-eye-off</v-icon>
                <i18n-t
                  keypath="page.tasks.questcard.objectiveshidden"
                  scope="global"
                  :plural="
                    props.task.objectives.length - relevantViewObjectives.length
                  "
                >
                  <template #count>
                    {{
                      props.task.objectives.length -
                      relevantViewObjectives.length
                    }}
                  </template>
                  <template #uncompleted>
                    {{ uncompletedIrrelevantObjectives.length }}
                  </template>
                </i18n-t>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col
          cols="12"
          xs="12"
          sm="12"
          md="2"
          lg="2"
          class="d-flex align-center justify-center"
        >
          <div class="d-block">
            <!-- Quest actions -->
            <template v-if="!isComplete && !isLocked">
              <!-- We are an available quest, so the primary button is the complete one -->
              <template v-if="!xs">
                <v-btn
                  size="x-large"
                  color="accent"
                  class="mx-1 my-1"
                  @click="markTaskComplete()"
                  ><v-icon class="mr-2">mdi-check-all</v-icon
                  >{{ $t("page.tasks.questcard.completebutton") }}</v-btn
                >
                <template v-if="props.task.alternatives?.length > 0">
                  <div class="d-flex justify-center">
                    {{ $t("page.tasks.questcard.alternatives") }}
                  </div>
                  <div
                    v-for="(alternative, altIndex) in props.task.alternatives"
                    :key="altIndex"
                    class="my-2"
                  >
                    <task-link
                      :task="tasks.find((t) => t.id == alternative)"
                      class="d-flex justify-center"
                    />
                  </div>
                </template>
              </template>
              <template v-else>
                <div class="d-flex justify-center">
                  <v-btn
                    color="accent"
                    class="mx-1 my-1"
                    @click="markTaskComplete()"
                    ><v-icon class="mr-2">mdi-check-all</v-icon
                    >{{ $t("page.tasks.questcard.completebutton") }}</v-btn
                  >
                </div>
              </template>
            </template>
            <template v-else-if="isComplete">
              <!-- We are a completed quest, so the primary button is the reset one -->
              <template v-if="!xs">
                <v-btn
                  size="x-large"
                  color="accent"
                  class="mx-1 my-1"
                  @click="markTaskUncomplete()"
                  ><v-icon class="mr-2">mdi-undo</v-icon
                  >{{ $t("page.tasks.questcard.uncompletebutton") }}</v-btn
                >
                <template v-if="props.task.alternatives?.length > 0">
                  <div class="d-flex justify-center">
                    {{ $t("page.tasks.questcard.alternativefailed") }}
                  </div>
                  <div
                    v-for="(alternative, altIndex) in props.task.alternatives"
                    :key="altIndex"
                    class="my-2"
                  >
                    <task-link
                      :task="tasks.find((t) => t.id == alternative)"
                      class="d-flex justify-center"
                    />
                  </div>
                </template>
              </template>
              <template v-else>
                <div class="d-flex justify-center">
                  <v-btn
                    color="accent"
                    class="mx-1 my-1"
                    @click="markTaskUncomplete()"
                    ><v-icon class="mr-2">mdi-undo</v-icon
                    >{{ $t("page.tasks.questcard.uncompletebutton") }}</v-btn
                  >
                </div>
              </template>
            </template>
            <template v-else-if="!isOurFaction">
              {{ $t("page.tasks.questcard.differentfaction") }}
            </template>
            <template v-else-if="isLocked">
              <!-- We are a locked quest, so the primary button is the unlock one -->
              <template v-if="!xs">
                <v-btn
                  size="x-large"
                  color="accent"
                  class="mx-1 my-1"
                  @click="markTaskAvailable()"
                  ><v-icon class="mr-2">mdi-fast-forward</v-icon
                  >{{ $t("page.tasks.questcard.availablebutton") }}</v-btn
                >
                <v-btn
                  size="x-large"
                  color="accent"
                  class="mx-1 my-1"
                  @click="markTaskComplete()"
                  ><v-icon class="mr-2">mdi-check-all</v-icon
                  >{{ $t("page.tasks.questcard.completebutton") }}</v-btn
                >
              </template>
              <template v-else>
                <div class="d-flex justify-center">
                  <v-btn
                    size="small"
                    color="accent"
                    class="mx-1 my-1"
                    @click="markTaskAvailable()"
                    ><v-icon class="mr-2">mdi-fast-forward</v-icon
                    >{{ $t("page.tasks.questcard.availablebutton") }}</v-btn
                  >
                  <v-btn
                    size="small"
                    color="accent"
                    class="mx-1 my-1"
                    @click="markTaskComplete()"
                    ><v-icon class="mr-2">mdi-check-all</v-icon
                    >{{ $t("page.tasks.questcard.completebutton") }}</v-btn
                  >
                </div>
              </template>
            </template>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar v-model="taskStatusUpdated" :timeout="4000" color="secondary">
      {{ taskStatus }}
      <template #actions>
        <v-btn color="white" variant="text" @click="taskStatusUpdated = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-sheet>
</template>
<script setup>
import { defineAsyncComponent, computed, ref } from "vue";
import { useDisplay } from "vuetify";
import { useTarkovStore } from "@/stores/tarkov.js";
import { useProgressStore } from "@/stores/progress";
import { useUserStore } from "@/stores/user";
import { useTarkovData } from "@/composables/tarkovdata";
import { useI18n } from "vue-i18n";
// Define the props for the component
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});
const { t } = useI18n({ useScope: "global" });
const tarkovStore = useTarkovStore();
const progressStore = useProgressStore();
const userStore = useUserStore();
const { tasks } = useTarkovData();

const TaskLink = defineAsyncComponent(() =>
  import("@/components/tasks/TaskLink.vue")
);
const TaskObjective = defineAsyncComponent(() =>
  import("@/components/tasks/TaskObjective.vue")
);
const TarkovItem = defineAsyncComponent(() =>
  import("@/components/TarkovItem.vue")
);

const { xs } = useDisplay();

const isComplete = computed(() => {
  return tarkovStore.isTaskComplete(props.task.id);
});

const isFailed = computed(() => {
  return tarkovStore.isTaskFailed(props.task.id);
});

const isLocked = computed(() => {
  return (
    progressStore.unlockedTasks[props.task.id]["self"] != true &&
    !isComplete.value
  );
});

const isOurFaction = computed(() => {
  // Check if the task is faction 'Any' or the user's faction
  return (
    props.task.factionName == "Any" ||
    props.task.factionName == tarkovStore.getPMCFaction
  );
});

const lockedBehind = computed(() => {
  // Calculate how many of the successors are uncompleted (should be all, but someone might have marked off one)
  return props.task.successors.filter((s) => !tarkovStore.isTaskComplete(s.id))
    .length;
});

const lockedBefore = computed(() => {
  // Calculate how many of the predecessors are uncompleted
  return props.task.predecessors.filter(
    (s) => !tarkovStore.isTaskComplete(s.id)
  ).length;
});

const nonKappa = computed(() => {
  return !props.task.kappaRequired;
});

const relevantViewObjectives = computed(() => {
  if (onMapView.value) {
    return props.task.objectives.filter((o) =>
      o?.maps.includes(userStore.getTaskMapView)
    );
  } else {
    return props.task.objectives;
  }
});

const factionImage = computed(() => {
  return `/img/factions/${props.task.factionName}.webp`;
});

const uncompletedIrrelevantObjectives = computed(() => {
  return props.task.objectives
    .filter((o) => !o?.maps.includes(userStore.getTaskMapView))
    .filter((o) => !tarkovStore.isTaskObjectiveComplete(o.id));
});

const onMapView = computed(() => {
  // If the primary task view is set to map, then we are on the map page
  return userStore.getTaskPrimaryView == "maps";
});

const markTaskComplete = () => {
  tarkovStore.setTaskComplete(props.task.id);
  // For each objective, mark it as complete
  props.task.objectives.forEach((o) => {
    tarkovStore.setTaskObjectiveComplete(o.id);
  });
  // For each alternative task, mark it as failed
  props.task.alternatives.forEach((a) => {
    tarkovStore.setTaskFailed(a);
    tasks.value
      .find((task) => task.id == a)
      .objectives.forEach((o) => {
        tarkovStore.setTaskObjectiveComplete(o.id);
      });
  });
  //if the player is not at the task level, set it to the task level
  if (tarkovStore.playerLevel < props.task.minPlayerLevel) {
    tarkovStore.setLevel(props.task.minPlayerLevel);
  }

  taskStatus.value = t("page.tasks.questcard.statuscomplete", {
    name: props.task.name,
  });
  taskStatusUpdated.value = true;
};

const markTaskUncomplete = () => {
  tarkovStore.setTaskUncompleted(props.task.id);
  // For each objective, mark it as uncomplete
  props.task.objectives.forEach((o) => {
    tarkovStore.setTaskObjectiveUncomplete(o.id);
  });
  // For each alternative task, mark it as uncomplete
  props.task.alternatives.forEach((a) => {
    tarkovStore.setTaskUncompleted(a);
    tasks.value
      .find((task) => task.id == a)
      .objectives.forEach((o) => {
        tarkovStore.setTaskObjectiveUncomplete(o.id);
      });
  });
  taskStatus.value = t("page.tasks.questcard.statusuncomplete", {
    name: props.task.name,
  });
  taskStatusUpdated.value = true;
};

const markTaskAvailable = () => {
  // Go through all the predecessors and mark them as complete
  props.task.predecessors.forEach((p) => {
    tarkovStore.setTaskComplete(p);
    tasks.value
      .find((task) => task.id == p)
      .objectives.forEach((o) => {
        tarkovStore.setTaskObjectiveComplete(o.id);
      });
  });
  // If our level is lower than the task level, set it to the task level
  if (tarkovStore.playerLevel < props.task.minPlayerLevel) {
    tarkovStore.setLevel(props.task.minPlayerLevel);
  }
  taskStatus.value = t("page.tasks.questcard.statusavailable", {
    name: props.task.name,
  });
  taskStatusUpdated.value = true;
};

const taskStatusUpdated = ref(false);
const taskStatus = ref("");
</script>
<style lang="scss" scoped>
.taskContainer {
  position: relative;
  overflow: hidden;
}

.taskContainerBackground {
  margin: 3rem;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: -1;
  transform: rotate(15deg);
  -webkit-transform: rotate(15deg);
  color: #c6afaf;
  opacity: 0.2;
}

.task-complete {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-complete), 1) 0%,
    rgba(var(--v-theme-complete), 0) 75%
  );
}

.task-locked {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-failure), 1) 0%,
    rgba(var(--v-theme-failure), 0) 75%
  );
}

.wiki-link {
  text-decoration: none;
  color: rgba(var(--v-theme-tasklink), 1) !important;
}

.hidden-objectives {
  opacity: 0.5;
}

.faction-icon {
  filter: invert(1);
  max-width: 24px;
  max-height: 24px;
}
</style>
