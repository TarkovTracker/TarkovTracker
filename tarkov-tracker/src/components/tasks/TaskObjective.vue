<template>
  <div class="d-flex align-center">
    <v-icon size="x-small" class="mr-1">{{ objectiveIcon }}</v-icon>{{ props.objective?.description }}
  </div>
</template>
<script setup>
import { computed } from 'vue'
// Define the props for the component
const props = defineProps({
  objective: {
    type: Object,
    required: true,
  }
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

</script>
<style lang="scss" scoped>

</style>