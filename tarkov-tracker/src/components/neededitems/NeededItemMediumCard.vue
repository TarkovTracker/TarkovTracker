<template>
  <KeepAlive>
    <v-lazy :options="{ threshold: 0.5 }" min-height="100" class="fill-height">
      <v-sheet rounded :class="itemCardClasses">
        <!-- Flexbox display -->
        <div class="d-flex align-end flex-column fill-height">
          <!-- Item image -->
          <div class="d-flex align-self-stretch item-panel">
            <v-img :src="item.image512pxLink" :lazy-src="item.baseImageLink" :class="itemImageClasses">
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </div>
          <!-- Item name, directly below item image -->
          <div class="d-flex align-self-center mt-2 mx-2">
            <div class="text-center px-2">
              {{ item.name }}
            </div>
          </div>
          <!-- Item need details -->
          <div class="d-flex flex-column align-self-center mt-2 mx-2">
            <template v-if="props.need.needType == 'taskObjective'">
              <task-link :task="relatedTask" />
              <v-row v-if="relatedTask.predecessors?.length > 0" no-gutters class="mb-1 mt-1 d-flex justify-center">
                <v-col cols="auto" class="mr-1" align="center">
                  <v-icon icon="mdi-lock-open-outline" />
                </v-col>
                <v-col cols="auto" align="center">
                  <i18n-t keypath="page.tasks.questcard.lockedbefore" scope="global">
                    <template #count>
                      {{ lockedBefore }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
              <v-row v-if="levelRequired > 0 && levelRequired > tarkovStore.playerLevel" no-gutters
                class="mb-1 mt-1 d-flex justify-center">
                <v-col cols="auto" class="mr-1" align="center">
                  <v-icon icon="mdi-menu-right" />
                </v-col>
                <v-col cols="auto" align="center">
                  <i18n-t keypath="page.tasks.questcard.level" scope="global">
                    <template #count>
                      {{ levelRequired }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
            </template>
            <template v-else-if="props.need.needType == 'hideoutModule'">
              <v-row dense no-gutters class="mb-1 mt-1 d-flex justify-center">
                <v-col cols="auto" align="center">
                  <station-link :station="relatedStation" class="justify-center" />
                </v-col>
                <v-col cols="auto" class="ml-1">{{
                  props.need.hideoutModule.level
                }}</v-col>
              </v-row>
              <v-row v-if="props.need.hideoutModule.predecessors?.length > 0" no-gutters
                class="mb-1 mt-1 d-flex justify-center">
                <v-col cols="auto" class="mr-1" align="center">
                  <v-icon icon="mdi-lock-open-outline" />
                </v-col>
                <v-col cols="auto" align="center">
                  <i18n-t keypath="page.tasks.questcard.lockedbefore" scope="global">
                    <template #count>
                      {{ lockedBefore }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
              <v-row v-if="levelRequired > 0" no-gutters class="mb-1 mt-1 d-flex justify-center">
                <v-col cols="auto" class="mr-1" align="center">
                  <v-icon icon="mdi-menu-right" />
                </v-col>
                <v-col cols="auto" align="center">
                  <i18n-t keypath="page.tasks.questcard.level" scope="global">
                    <template #count>
                      {{ levelRequired }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
            </template>
          </div>
          <!-- Item count actions -->
          <div class="d-flex align-self-stretch justify-space-between mt-auto mb-2 mx-2">
            <div>
              <v-btn variant="tonal" class="pa-0 ma-0" @click="decreaseCount()"><v-icon>mdi-minus-thick</v-icon></v-btn>
            </div>
            <div class="mx-1">
              <v-btn variant="tonal" class="pa-0 px-1 ma-0" @click="toggleCount()">
                {{ currentCount.toLocaleString() }}/{{ neededCount.toLocaleString() }}
              </v-btn>
            </div>
            <div>
              <v-btn variant="tonal" class="pa-0 ma-0" @click="increaseCount()"><v-icon>mdi-plus-thick</v-icon></v-btn>
            </div>
          </div>
        </div>
      </v-sheet>
    </v-lazy>
  </KeepAlive>
</template>
<script setup>
import { defineAsyncComponent, computed, inject } from "vue";
import { useUserStore } from "@/stores/user";
import { useProgressStore } from "@/stores/progress";
import { useTarkovData } from "@/composables/tarkovdata";
import { useTarkovStore } from "@/stores/tarkov";
const TaskLink = defineAsyncComponent(() =>
  import("@/components/tasks/TaskLink.vue")
);
const StationLink = defineAsyncComponent(() =>
  import("@/components/hideout/StationLink.vue")
);
const props = defineProps({
  need: {
    type: Object,
    required: true,
  },
});
const userStore = useUserStore();
const progressStore = useProgressStore();
const tarkovStore = useTarkovStore();

const { tasks, hideoutStations } = useTarkovData();

const selfCompletedNeed = computed(() => {
  if (props.need.needType == "taskObjective") {
    return (
      progressStore.tasksCompletions[props.need.taskId]["self"] ||
      progressStore.objectiveCompletions[props.need.id]["self"]
    );
  } else if (props.need.needType == "hideoutModule") {
    return (
      progressStore.moduleCompletions[props.need.hideoutModule.id]["self"] ||
      progressStore.modulePartCompletions[props.need.id]["self"]
    );
  } else {
    return false;
  }
});

const relatedTask = computed(() => {
  if (props.need.needType == "taskObjective") {
    return tasks.value.find((t) => t.id == props.need.taskId);
  } else {
    return null;
  }
});

const relatedStation = computed(() => {
  if (props.need.needType == "hideoutModule") {
    return Object.values(hideoutStations.value).find(
      (s) => s.id == props.need.hideoutModule.stationId
    );
  } else {
    return null;
  }
});

const lockedBefore = computed(() => {
  if (props.need.needType == "taskObjective") {
    return relatedTask.value.predecessors.filter(
      (s) => !tarkovStore.isTaskComplete(s.id)
    ).length;
  } else if (props.need.needType == "hideoutModule") {
    return props.need.hideoutModule.predecessors.filter(
      (s) => !tarkovStore.isHideoutModuleComplete(s.id)
    ).length;
  } else {
    return 0;
  }
});

const itemImageClasses = computed(() => {
  return {
    [`item-bg-${item.value.backgroundColor}`]: true,
    rounded: true,
    "elevation-2": true,
    "item-image": true,
    "pa-1": true,
    "fill-height": true,
  };
});

const itemCardClasses = computed(() => {
  return {
    "item-complete": selfCompletedNeed.value || currentCount.value >= neededCount.value,
    "fill-height": true,
  };
});

const currentCount = computed(() => {
  if (props.need.needType == "taskObjective") {
    return tarkovStore.getObjectiveCount(props.need.id);
  } else if (props.need.needType == "hideoutModule") {
    return tarkovStore.getHideoutPartCount(props.need.id);
  } else {
    return 0;
  }
});

const decreaseCount = () => {
  if (props.need.needType == "taskObjective") {
    if (currentCount.value > 0) {
      tarkovStore.setObjectiveCount(props.need.id, currentCount.value - 1);
    }
  } else if (props.need.needType == "hideoutModule") {
    if (currentCount.value > 0) {
      tarkovStore.setHideoutPartCount(props.need.id, currentCount.value - 1);
    }
  }
};

const increaseCount = () => {
  if (props.need.needType == "taskObjective") {
    if (currentCount.value < neededCount.value) {
      tarkovStore.setObjectiveCount(props.need.id, currentCount.value + 1);
    }
  } else if (props.need.needType == "hideoutModule") {
    if (currentCount.value < neededCount.value) {
      tarkovStore.setHideoutPartCount(props.need.id, currentCount.value + 1);
    }
  }
};

const levelRequired = computed(() => {
  if (props.need.needType == "taskObjective") {
    return relatedTask.value.minPlayerLevel;
  } else if (props.need.needType == "hideoutModule") {
    return 0;
  } else {
    return 0;
  }
});

const toggleCount = () => {
  if (props.need.needType == "taskObjective") {
    if (currentCount.value === 0) {
      tarkovStore.setObjectiveCount(props.need.id, neededCount.value);
    } else if (currentCount.value === neededCount.value) {
      tarkovStore.setObjectiveCount(props.need.id, 0);
    } else {
      tarkovStore.setObjectiveCount(props.need.id, neededCount.value);
    }
  } else if (props.need.needType == "hideoutModule") {
    if (currentCount.value === 0) {
      tarkovStore.setHideoutPartCount(props.need.id, neededCount.value);
    } else if (currentCount.value === neededCount.value) {
      tarkovStore.setHideoutPartCount(props.need.id, 0);
    } else {
      tarkovStore.setHideoutPartCount(props.need.id, neededCount.value);
    }
  }
};

const neededCount = computed(() => {
  if (props.need.needType == "taskObjective" && props.need.count) {
    return props.need.count;
  } else if (props.need.needType == "hideoutModule" && props.need.count) {
    return props.need.count;
  } else {
    return 1;
  }
});

const item = computed(() => {
  if (props.need.needType == "taskObjective") {
    if (props.need.type == "mark") {
      return props.need.markerItem;
    } else if (props.need.type == "buildWeapon") {
      return props.need.item;
    } else if (props.need.type == "plantItem") {
      return props.need.item;
    } else if (props.need.type == "giveItem") {
      return props.need.item;
    } else {
      return null;
    }
  } else if (props.need.needType == "hideoutModule") {
    return props.need.item;
  } else {
    return null;
  }
});
</script>
<style lang="scss">
.item-complete {
  background: linear-gradient(0deg,
      rgba(var(--v-theme-complete), 1) 0%,
      rgba(var(--v-theme-surface), 1) 75%) !important;
}

.item-panel {
  aspect-ratio: 16/9;
  min-height: 100px;
}

.item-image {
  min-height: 90px;
}

.item-bg-violet {
  background-color: #2c232f;
}

.item-bg-grey {
  background-color: #1e1e1e;
}

.item-bg-yellow {
  background-color: #343421;
}

.item-bg-orange {
  background-color: #261d14;
}

.item-bg-green {
  background-color: #1a2314;
}

.item-bg-red {
  background-color: #38221f;
}

.item-bg-default {
  background-color: #3a3c3b;
}

.item-bg-black {
  background-color: #141614;
}

.item-bg-blue {
  background-color: #202d32;
}
</style>
