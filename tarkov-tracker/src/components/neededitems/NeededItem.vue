<template>
  <template v-if="props.itemStyle == 'mediumCard'">
    <v-col v-if="showItemFilter" cols="12" sm="6" md="4" lg="3" xl="2">
      <NeededItemMediumCard :need="props.need" @decrease-count="decreaseCount()" @toggle-count="toggleCount()"
        @increase-count="increaseCount()" />
    </v-col>
  </template>
  <template v-else-if="props.itemStyle == 'smallCard'">
    <v-col v-if="showItemFilter" cols="auto">
      <NeededItemSmallCard :need="props.need" @decrease-count="decreaseCount()" @toggle-count="toggleCount()"
        @increase-count="increaseCount()" />
    </v-col>
  </template>
  <template v-else-if="props.itemStyle == 'row'">
    <v-col v-if="showItemFilter" cols="12" class="pt-1">
      <NeededItemRow :need="props.need" @decrease-count="decreaseCount()" @toggle-count="toggleCount()"
        @increase-count="increaseCount()" />
    </v-col>
  </template>
</template>
<script setup>
import { defineAsyncComponent, computed, inject, provide } from "vue";
import { useUserStore } from "@/stores/user";
import { useProgressStore } from "@/stores/progress";
import { useTarkovData } from "@/composables/tarkovdata";
import { useTarkovStore } from "@/stores/tarkov";
const NeededItemMediumCard = defineAsyncComponent(() =>
  import("@/components/neededitems/NeededItemMediumCard.vue")
);
const NeededItemSmallCard = defineAsyncComponent(() =>
  import("@/components/neededitems/NeededItemSmallCard.vue")
);
const NeededItemRow = defineAsyncComponent(() =>
  import("@/components/neededitems/NeededItemRow.vue")
);
const props = defineProps({
  need: {
    type: Object,
    required: true,
  },
  itemStyle: {
    type: String,
    default: "mediumCard",
  },
});
const userStore = useUserStore();
const progressStore = useProgressStore();
const tarkovStore = useTarkovStore();

const { tasks, hideoutStations } = useTarkovData();

// Helper functions and data to calculate if the item should be shown based
// on the user's/team's progress and the user's filters
const filterString = inject("itemFilterName");
const showItemFilter = computed(() => {
  if (filterString.value == "") {
    return showItem.value;
  } else {
    return (
      (item.value.shortName
        .toLowerCase()
        .includes(filterString.value.toLowerCase()) ||
        item.value.name
          .toLowerCase()
          .includes(filterString.value.toLowerCase())) &&
      showItem.value
    );
  }
});

const showItem = computed(() => {
  if (props.need.needType == "taskObjective") {
    return isTaskObjectiveNeeded(props.need);
  } else if (props.need.needType == "hideoutModule") {
    return isHideoutModuleNeeded(props.need);
  } else {
    return false;
  }
});

function isTaskObjectiveNeeded(need) {
  if (userStore.itemsNeededHideNonFIR) {
    if (
      need.type == "mark" ||
      need.type == "buildWeapon" ||
      need.type == "plantItem"
    ) {
      return false;
    } else if (need.type == "giveItem") {
      if (need.foundInRaid == false) {
        return false;
      }
    }
  }

  if (userStore.hideNonKappaTasks && !relatedTask.value.kappaRequired) {
    return false;
  }

  if (userStore.itemsTeamAllHidden) {
    // Only show if the objective is needed by ourself
    return (
      !progressStore.tasksCompletions[need.taskId]?.self &&
      !progressStore.objectiveCompletions[need.id]?.self &&
      ["Any", tarkovStore.getPMCFaction].some(
        (faction) => faction == relatedTask.value.factionName
      )
    );
  } else if (userStore.itemsTeamNonFIRHidden) {
    // Only show if a someone needs the objective
    return (
      need.foundInRaid &&
      // Check if any user has not completed the task (and that its a relevant faction task for them)
      Object.entries(progressStore.tasksCompletions[need.taskId]).some(
        ([userTeamId, userStatus]) =>
          ["Any", progressStore.playerFaction[userTeamId]].some(
            (faction) => faction == relatedTask.value.factionName
          ) && userStatus === false
      ) &&
      // Check if any user has not completed the objective (and that its a relevant faction task for them)
      Object.entries(progressStore.objectiveCompletions[need.id]).some(
        ([userTeamId, userStatus]) =>
          ["Any", progressStore.playerFaction[userTeamId]].some(
            (faction) => faction == relatedTask.value.factionName
          ) && userStatus === false
      )
    );
  } else {
    return (
      Object.entries(progressStore.tasksCompletions[need.taskId]).some(
        ([userTeamId, userStatus]) =>
          ["Any", progressStore.playerFaction[userTeamId]].some(
            (faction) => faction == relatedTask.value.factionName
          ) && userStatus === false
      ) &&
      Object.entries(progressStore.objectiveCompletions[need.id]).some(
        ([userTeamId, userStatus]) =>
          ["Any", progressStore.playerFaction[userTeamId]].some(
            (faction) => faction == relatedTask.value.factionName
          ) && userStatus === false
      )
    );
  }
}

function isHideoutModuleNeeded(need) {
  if (userStore.itemsTeamAllHidden || userStore.itemsTeamHideoutHidden) {
    // Only show if the objective is needed by ourself
    return (
      !progressStore.moduleCompletions[need.hideoutModule.id]?.self &&
      !progressStore.modulePartCompletions[need.id]?.self
    );
  } else {
    return (
      Object.values(
        progressStore.moduleCompletions[need.hideoutModule.id]
      ).some((userStatus) => userStatus === false) &&
      Object.values(progressStore.modulePartCompletions[need.id]).some(
        (userStatus) => userStatus === false
      )
    );
  }
}

// Emit functions to update the user's progress towards the need
// the child functions emit these functions and we watch for them here
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

const imageItem = computed(() => {
  if (item.value?.properties?.defaultPreset) {
    return item.value.properties.defaultPreset;
  } else {
    return item.value;
  }
})


// Helper functions and data to calculate the item's progress
// These are passed to the child components via provide/inject
const currentCount = computed(() => {
  if (selfCompletedNeed.value) {
    return neededCount.value;
  }
  if (props.need.needType == "taskObjective") {
    return tarkovStore.getObjectiveCount(props.need.id);
  } else if (props.need.needType == "hideoutModule") {
    return tarkovStore.getHideoutPartCount(props.need.id);
  } else {
    return 0;
  }
});

const neededCount = computed(() => {
  if (props.need.needType == "taskObjective" && props.need.count) {
    return props.need.count;
  } else if (props.need.needType == "hideoutModule" && props.need.count) {
    return props.need.count;
  } else {
    return 1;
  }
});

const relatedTask = computed(() => {
  if (props.need.needType == "taskObjective") {
    return tasks.value.find((t) => t.id == props.need.taskId);
  } else {
    return null;
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

const lockedBefore = computed(() => {
  if (props.need.needType == "taskObjective") {
    return relatedTask.value.predecessors.filter(
      (s) => !tarkovStore.isTaskComplete(s)
    ).length;
  } else if (props.need.needType == "hideoutModule") {
    return props.need.hideoutModule.predecessors.filter(
      (s) => !tarkovStore.isHideoutModuleComplete(s)
    ).length;
  } else {
    return 0;
  }
});

const selfCompletedNeed = computed(() => {
  if (props.need.needType == "taskObjective") {
    return (
      progressStore.tasksCompletions[props.need.taskId]["self"] ||
      progressStore.objectiveCompletions[props.need.id]["self"] ||
      relatedTask.value.factionName != "Any" && relatedTask.value.factionName != tarkovStore.getPMCFaction
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

const relatedStation = computed(() => {
  if (props.need.needType == "hideoutModule") {
    return Object.values(hideoutStations.value).find(
      (s) => s.id == props.need.hideoutModule.stationId
    );
  } else {
    return null;
  }
});

const levelRequired = computed(() => {
  if (props.need.needType == "taskObjective") {
    return relatedTask.value.minPlayerLevel;
  } else if (props.need.needType == "hideoutModule") {
    return 0;
  } else {
    return 0;
  }
});

const teamNeeds = computed(() => {
  let needingUsers = [];
  if (props.need.needType == "taskObjective") {
    // Find all of the users that need this objective
    Object.entries(progressStore.objectiveCompletions[props.need.id]).forEach(
      ([user, completed]) => {
        if (!completed && !progressStore.tasksCompletions[props.need.taskId][user]) {
          needingUsers.push({ user: user, count: progressStore.teamStores[user].getObjectiveCount(props.need.id) });
        }
      }
    );
  } else if (props.need.needType == "hideoutModule") {
    // Find all of the users that need this module
    Object.entries(progressStore.modulePartCompletions[props.need.id]).forEach(
      ([user, completed]) => {
        if (!completed) {
          needingUsers.push({ user: user, count: progressStore.teamStores[user].getHideoutPartCount(props.need.id) });
        }
      }
    );
  }
  return needingUsers;
});

provide('neededitem', {
  item,
  relatedTask,
  relatedStation,
  selfCompletedNeed,
  lockedBefore,
  currentCount,
  neededCount,
  levelRequired,
  teamNeeds,
  imageItem
})
</script>
<style lang="scss">
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
