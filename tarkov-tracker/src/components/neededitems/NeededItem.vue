<template>
  <template v-if="props.itemStyle == 'mediumCard'">
    <v-col v-if="showItemFilter" cols="12" sm="6" md="4" lg="3" xl="2">
      <NeededItemMediumCard :item="item" :need="props.need" />
    </v-col>
  </template>
  <template v-else-if="props.itemStyle == 'smallCard'">
    <v-col v-if="showItemFilter" cols="auto">
      <NeededItemSmallCard :item="item" :need="props.need" />
    </v-col>
  </template>
  <template v-else-if="props.itemStyle == 'row'">
    <v-col v-if="showItemFilter" cols="12" class="pt-1">
      <NeededItemRow :item="item" :need="props.need" />
    </v-col>
  </template>
</template>
<script setup>
import { defineAsyncComponent, computed, inject } from "vue";
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

const { tasks } = useTarkovData();

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
