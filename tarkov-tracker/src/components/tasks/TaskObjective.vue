<template>
  <span>
    <div
      class="d-flex align-center pa-1 rounded clickable"
      :class="{ 'objective-complete': isComplete }"
      @click="toggleObjectiveCompletion()"
      @mouseenter="objectiveMouseEnter()"
      @mouseleave="objectiveMouseLeave()"
    >
      <v-icon size="x-small" class="mr-1">{{ objectiveIcon }}</v-icon
      >{{ props.objective?.description }}
    </div>
    <v-row
      v-if="
        (systemStore.userTeam && userNeeds.length > 0) ||
        itemObjectiveTypes.includes(fullObjective.type)
      "
      align="center"
      class="pa-0 ml-0"
      style="font-size: smaller; margin-top: 1px; margin-bottom: 1px"
    >
      <v-col
        cols="auto"
        v-if="itemObjectiveTypes.includes(fullObjective.type)"
        class="pa-0 d-flex align-center"
      >
        <v-sheet
          class="rounded-lg pr-0 d-flex align-start mb-2"
          color="accent"
          style="width: fit-content"
        >
          <tarkov-item
            :item-id="relatedItem.id"
            :item-name="relatedItem.shortName"
            :dev-link="relatedItem.link"
            :wiki-link="relatedItem.wikiLink"
            :count="fullObjective.count ?? 1"
            class="mr-2"
          />
        </v-sheet>
      </v-col>
      <v-col
        cols="auto"
        v-if="systemStore.userTeam && userNeeds.length > 0"
        class="pa-0"
      >
        <span v-for="(user, userIndex) in userNeeds" :key="userIndex">
          <v-icon size="x-small" class="ml-1">mdi-account-child-circle</v-icon
          >{{ progressStore.teammemberNames[user] }}
        </span>
      </v-col>
    </v-row>
  </span>
</template>
<script setup>
import { computed, ref, defineAsyncComponent } from "vue";
import { useTarkovStore } from "@/stores/tarkov.js";
import { useTarkovData } from "@/composables/tarkovdata.js";
import { useProgressStore } from "@/stores/progress";
import { useLiveData } from "@/composables/livedata";
const { useSystemStore } = useLiveData();
const systemStore = useSystemStore();
// Define the props for the component
const props = defineProps({
  objective: {
    type: Object,
    required: true,
  },
});
const TarkovItem = defineAsyncComponent(() =>
  import("@/components/TarkovItem.vue")
);
const { objectives, neededItemTaskObjectives } = useTarkovData();
const tarkovStore = useTarkovStore();
const progressStore = useProgressStore();

const isComplete = computed(() => {
  return tarkovStore.isTaskObjectiveComplete(props.objective.id);
});

const fullObjective = computed(() => {
  return objectives.value.find((o) => o.id == props.objective.id);
});

const itemObjectiveTypes = ["giveItem", "mark", "buildWeapon", "plantItem"];

const relatedItem = computed(() => {
  // Select case fullObjective.type
  switch (fullObjective.value.type) {
    case "giveItem":
      return fullObjective.value.item;
    case "mark":
      return fullObjective.value.markerItem;
    case "buildWeapon":
      return fullObjective.value.item;
    case "plantItem":
      return fullObjective.value.item;
    default:
      return null;
  }
});

const userNeeds = computed(() => {
  let needingUsers = [];
  if (fullObjective.value == undefined) {
    return needingUsers;
  }
  Object.entries(
    progressStore.unlockedTasks[fullObjective.value.taskId]
  ).forEach(([teamId, unlocked]) => {
    if (
      unlocked &&
      progressStore.objectiveCompletions?.[props.objective.id]?.[teamId] ==
        false
    ) {
      needingUsers.push(teamId);
    }
  });
  return needingUsers;
});

const isHovered = ref(false);

const objectiveMouseEnter = () => {
  isHovered.value = true;
};

const objectiveMouseLeave = () => {
  isHovered.value = false;
};

const objectiveIcon = computed(() => {
  if (isHovered.value) {
    if (isComplete.value) {
      return "mdi-close-circle";
    } else {
      return "mdi-check-circle";
    }
  }
  let iconMap = {
    key: "mdi-key",
    shoot: "mdi-target-account",
    giveItem: "mdi-close-circle-outline",
    findItem: "mdi-checkbox-marked-circle-outline",
    findQuestItem: "mdi-alert-circle-outline",
    giveQuestItem: "mdi-alert-circle-check-outline",
    plantQuestItem: "mdi-arrow-down-thin-circle-outline",
    plantItem: "mdi-arrow-down-thin-circle-outline",
    taskStatus: "mdi-account-child-circle",
    extract: "mdi-heart-circle-outline",
    mark: "mdi-remote",
    place: "mdi-arrow-down-drop-circle-outline",
    traderLevel: "mdi-thumb-up",
    traderStanding: "mdi-thumb-up",
    skill: "mdi-dumbbell",
    visit: "mdi-crosshairs-gps",
    buildWeapon: "mdi-progress-wrench",
    playerLevel: "mdi-crown-circle-outline",
    experience: "mdi-eye-circle-outline",
    warning: "mdi-alert-circle",
  };
  return iconMap[props.objective.type] || "mdi-help-circle";
});

const toggleObjectiveCompletion = () => {
  tarkovStore.toggleTaskObjectiveComplete(props.objective.id);
};
</script>
<style lang="scss" scoped>
.objective-complete {
  //background: rgb(var(--v-theme-complete));
  background: linear-gradient(
    175deg,
    rgba(var(--v-theme-complete), 1) 0%,
    rgba(var(--v-theme-complete), 0) 75%
  );
}

.clickable {
  cursor: pointer;
}
</style>
