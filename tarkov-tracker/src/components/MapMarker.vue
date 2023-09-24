<template>
  <div
    :style="markerStyle"
    :class="markerColor"
    @mouseenter="showTooltip()"
    @mouseleave="hideTooltip()"
    @click="forceTooltipToggle()"
  >
    <v-icon>{{
      tooltipVisible == true ? "mdi-map-marker-radius" : "mdi-map-marker"
    }}</v-icon>
  </div>
  <div v-if="tooltipVisible" :style="tooltipStyle">
    <v-sheet class="ma-0 elevation-3 rounded px-1 pt-2" color="primary">
      <task-link :task="relatedTask" />
      <task-objective
        v-if="props.mark.objectiveId"
        :objective="objectives.find((obj) => obj.id == props.mark.objectiveId)"
      />
    </v-sheet>
  </div>
</template>
<script setup>
import { defineProps, computed, defineAsyncComponent, ref } from "vue";
import { useTarkovData } from "@/composables/tarkovdata.js";

const TaskObjective = defineAsyncComponent(() =>
  import("@/components/tasks/TaskObjective.vue")
);
const TaskLink = defineAsyncComponent(() =>
  import("@/components/tasks/TaskLink.vue")
);
const { objectives, tasks } = useTarkovData();
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

const forceTooltip = ref(false);
const hoverTooltip = ref(false);

const forceTooltipToggle = () => {
  forceTooltip.value = !forceTooltip.value;
};

const showTooltip = () => {
  hoverTooltip.value = true;
};

const hideTooltip = () => {
  hoverTooltip.value = false;
};

const tooltipVisible = computed(() => {
  if (props.mark.floor !== props.selectedFloor) return false;
  return forceTooltip.value || hoverTooltip.value;
});

const relatedObjective = computed(() => {
  return objectives.value.find((obj) => obj.id == props.mark.objectiveId);
});

const relatedTask = computed(() => {
  return tasks.value.find((task) => task.id == relatedObjective.value?.taskId);
});

const markerColor = computed(() => {
  return props.mark.users.includes('self') ? 'text-red' : 'text-orange';
});

const markerStyle = computed(() => {
  return {
    position: "absolute",
    top: props.mark.topPercent + "%",
    left: props.mark.leftPercent + "%",
    width: "20px",
    height: "20px",
    transform: "translate(-50%, -50%)",
    cursor: props.mark.floor === props.selectedFloor ? "pointer" : "inherit",
    opacity: props.mark.floor === props.selectedFloor ? 1 : 0.2,
  };
});

const tooltipStyle = computed(() => {
  return {
    position: "absolute",
    top: props.mark.topPercent + "%",
    left: props.mark.leftPercent + "%",
    transform: "translate(-50%, -125%)",
  };
});
</script>
<style lang="scss">
.objective-gps-tooltip {
  width: 100%;
}
</style>
