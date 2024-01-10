<template>
  <div :style="markerStyle" :class="markerColor" @mouseenter="showTooltip()" @mouseleave="hideTooltip()"
    @click="forceTooltipToggle()">
    <v-icon>{{
      tooltipVisible == true ? "mdi-map-marker-radius" : "mdi-map-marker"
    }}</v-icon>
  </div>
  <div v-if="tooltipVisible" :style="tooltipStyle">
    <v-sheet class="ma-0 elevation-3 rounded px-1 pt-2" color="primary">
      <task-link :task="relatedTask" show-wiki-link />
      <task-objective v-if="props.mark.id" :objective="objectives.find((obj) => obj.id == props.mark.id)" />
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
  markLocation: {
    type: Object,
    required: true,
  },
  selectedFloor: {
    type: String,
    required: false,
  },
  map: {
    type: Object,
    required: true,
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
  //if (props.mark.floor !== props.selectedFloor) return false;
  return forceTooltip.value || hoverTooltip.value;
});

const relatedObjective = computed(() => {
  return objectives.value.find((obj) => obj.id == props.mark.id);
});

const relatedTask = computed(() => {
  return tasks.value.find((task) => task.id == relatedObjective.value?.taskId);
});

const markerColor = computed(() => {
  return props.mark.users.includes('self') ? 'text-red' : 'text-orange';
});

const relativeLocation = computed(() => {
  let rotation = props.map.svg.coordinateRotation * (Math.PI / 180);

  // Take the bounds of the map and figure out the initial relative position
  let mapLeft = props.map.svg.bounds[0][0];
  let mapXmin = Math.min(props.map.svg.bounds[0][0], props.map.svg.bounds[0][1]);
  let mapZmin = Math.min(props.map.svg.bounds[1][0], props.map.svg.bounds[1][1]);
  let mapTop = props.map.svg.bounds[1][0];
  let mapWidth = Math.max(props.map.svg.bounds[0][0], props.map.svg.bounds[0][1]) - Math.min(props.map.svg.bounds[0][0], props.map.svg.bounds[0][1]);
  let mapHeight = Math.max(props.map.svg.bounds[1][0], props.map.svg.bounds[1][1]) - Math.min(props.map.svg.bounds[1][0], props.map.svg.bounds[1][1]);

  // Translate the position to be relative to the center of the map
  let mapCenterX = mapXmin + (mapWidth / 2);
  let mapCenterZ = mapZmin + (mapHeight / 2);
  let centerRelativeX = props.markLocation.positions[0].x - mapCenterX;
  let centerRelativeZ = props.markLocation.positions[0].z - mapCenterZ;
  let rotatedX = centerRelativeX * Math.cos(rotation) - centerRelativeZ * Math.sin(rotation);
  let rotatedZ = centerRelativeX * Math.sin(rotation) + centerRelativeZ * Math.cos(rotation);

  // Translate the position back
  let shiftedX = rotatedX + mapCenterX;
  let shiftedZ = rotatedZ + mapCenterZ;

  let relativeLeft = Math.abs(shiftedX - mapXmin);
  let relativeTop = Math.abs(shiftedZ - mapZmin);
  let relativeLeftPercent = (relativeLeft / mapWidth) * 100;
  let relativeTopPercent = (relativeTop / mapHeight) * 100;
  // Rotate the relative position based on the rotation of the map


  return {
    leftPercent: relativeLeftPercent,
    topPercent: relativeTopPercent,
  };
});

const markerStyle = computed(() => {
  return {
    position: "absolute",
    bottom: (100 - relativeLocation.value.topPercent) + "%",
    left: relativeLocation.value.leftPercent + "%",
    width: "20px",
    height: "20px",
    transform: "translate(-50%, -50%)",
    // cursor: props.mark.floor === props.selectedFloor ? "pointer" : "inherit",
    // opacity: props.mark.floor === props.selectedFloor ? 1 : 0.2,
    cursor: "pointer",
    opacity: 1,
  };
});

const tooltipStyle = computed(() => {
  return {
    position: "absolute",
    top: relativeLocation.value.topPercent + "%",
    left: relativeLocation.value.leftPercent + "%",
    transform: "translate(-50%, -125%)",
  };
});
</script>
<style lang="scss">
.objective-gps-tooltip {
  width: 100%;
}
</style>
