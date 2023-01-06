<template>
  <div :style="markerStyle" class="text-red"><v-icon>mdi-map-marker</v-icon>
    <v-tooltip v-if="props.mark.floor == props.selectedFloor" activator="parent" location="top" attach
      content-class="objective-gps-tooltip pa-0 rounded">
      <v-sheet class="ma-0 elevation-3 rounded px-1 pt-2">
        <task-link :task="relatedTask" />
        <task-objective v-if="props.mark.objectiveId"
          :objective="objectives.find(obj => obj.id == props.mark.objectiveId)" style="min-width: 400px;" />
      </v-sheet>
    </v-tooltip>
  </div>
</template>
<script setup>
import { defineProps, computed, defineAsyncComponent } from "vue";
import { useTarkovData } from "@/composables/tarkovdata.js";
const TaskObjective = defineAsyncComponent(() =>
  import("@/components/tasks/TaskObjective.vue")
)
const TaskLink = defineAsyncComponent(() =>
  import("@/components/tasks/TaskLink.vue")
)
const { objectives, tasks } = useTarkovData()
const props = defineProps({
  mark: {
    type: Object,
    required: true,
  },
  selectedFloor: {
    type: String,
    required: false,
  },
});

const relatedObjective = computed(() => {
  return objectives.value.find(obj => obj.id == props.mark.objectiveId)
})

const relatedTask = computed(() => {
  return tasks.value.find(task => task.id == relatedObjective.value.taskId)
})

const markerStyle = computed(() => {
  return {
    position: "absolute",
    top: props.mark.topPercent + "%",
    left: props.mark.leftPercent + "%",
    width: "20px",
    height: "20px",
    transform: 'translate(-50%, -50%)',
    cursor: props.mark.floor === props.selectedFloor ? 'pointer' : 'inherit',
    opacity: props.mark.floor === props.selectedFloor ? 1 : 0.2,
  };
});
</script>
<style lang="scss">
.objective-gps-tooltip {
  width: 100%;
}
</style>