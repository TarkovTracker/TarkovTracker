<template>
  <div class="d-flex align-center pa-1 rounded" :class="{ 'objective-complete': isComplete }"
    @click="toggleObjectiveCompletion()">
    <v-icon size="x-small" class="mr-1">{{ objectiveIcon }}</v-icon>{{ props.objective?.description }}
    <span v-if="systemStore.userTeam" class="ml-2">
      <span v-for="user, userIndex in userNeeds" :key="userIndex">
        <v-icon size="x-small" class="ml-1">mdi-account-child-circle</v-icon>{{ progressStore.teammemberNames[user] }}
      </span>
    </span>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useTarkovStore } from "@/stores/tarkov.js";
import { useTarkovData } from "@/composables/tarkovdata.js";
import { useProgressStore } from '@/stores/progress'
import { useLiveData } from '@/composables/livedata'
const { useSystemStore } = useLiveData()
const systemStore = useSystemStore()
// Define the props for the component
const props = defineProps({
  objective: {
    type: Object,
    required: true,
  }
})
const { objectives } = useTarkovData()
const tarkovStore = useTarkovStore()
const progressStore = useProgressStore()

const isComplete = computed(() => {
  return tarkovStore.isTaskObjectiveComplete(props.objective.id)
})

const fullObjective = computed(() => {
  return objectives.value.find(o => o.id == props.objective.id)
})

const userNeeds = computed(() => {
  let needingUsers = []
  if (fullObjective.value == undefined) {

    return needingUsers
  }
  Object.entries(progressStore.unlockedTasks[fullObjective.value.taskId]).forEach(([teamId, unlocked]) => {
    if (unlocked && progressStore.objectiveCompletions?.[props.objective.id]?.[teamId] == false) {
      needingUsers.push(teamId)
    }
  })
  return needingUsers
})

const objectiveIcon = computed(() => {
  let iconMap = {
    key: 'mdi-key',
    shoot: 'mdi-target-account',
    giveItem: 'mdi-close-circle-outline',
    findItem: 'mdi-checkbox-marked-circle-outline',
    findQuestItem: 'mdi-alert-circle-outline',
    giveQuestItem: 'mdi-alert-circle-check-outline',
    plantQuestItem: 'mdi-arrow-down-thin-circle-outline',
    plantItem: 'mdi-arrow-down-thin-circle-outline',
    taskStatus: 'mdi-account-child-circle',
    extract: 'mdi-heart-circle-outline',
    mark: 'mdi-remote',
    place: 'mdi-arrow-down-drop-circle-outline',
    traderLevel: 'mdi-thumb-up',
    skill: 'mdi-dumbbell',
    visit: 'mdi-crosshairs-gps',
    buildWeapon: 'mdi-progress-wrench',
    playerLevel: 'mdi-crown-circle-outline',
    experience: 'mdi-eye-circle-outline',
    warning: 'mdi-alert-circle'
  }
  return iconMap[props.objective.type] || 'mdi-help-circle'
})

const toggleObjectiveCompletion = () => {
  tarkovStore.toggleTaskObjectiveComplete(props.objective.id)
}

</script>
<style lang="scss" scoped>
.objective-complete {
  //background: rgb(var(--v-theme-complete));
  background: linear-gradient(175deg, rgba(var(--v-theme-complete), 1) 0%, rgba(var(--v-theme-complete), 0) 75%);
}
</style>