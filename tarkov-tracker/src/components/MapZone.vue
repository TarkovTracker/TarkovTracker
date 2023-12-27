<template>
  <div :style="zoneStyle" :class="zoneColor" @mouseenter="showTooltip()" @mouseleave="hideTooltip()"
    @click="forceTooltipToggle()">
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
  zoneLocation: {
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

const zoneColor = computed(() => {
  if (tooltipVisible.value) return 'text-green';
  return props.mark.users.includes('self') ? 'text-red' : 'text-orange';
});

const relativeLocation = computed(() => {
  // Determine the leftmost x position in the array of zone positions
  // Take the bounds of the map and figure out the initial relative position
  let mapLeft = props.map.svg.bounds[0][0];
  let mapTop = props.map.svg.bounds[0][1];
  let mapWidth = Math.max(props.map.svg.bounds[0][0], props.map.svg.bounds[1][0]) - Math.min(props.map.svg.bounds[0][0], props.map.svg.bounds[1][0]);
  let mapHeight = Math.max(props.map.svg.bounds[0][1], props.map.svg.bounds[1][1]) - Math.min(props.map.svg.bounds[0][1], props.map.svg.bounds[1][1]);

  let outlinePercents = []
  props.zoneLocation.outline.forEach((outline) => {
    // Calculate relative values using the coordinate system of the map
    let relativeLeft = Math.abs(outline.x - mapLeft);
    let relativeTop = Math.abs(outline.z - mapTop);
    // Calculate relative values relative to the map container
    let relativeLeftPercent = (relativeLeft / mapWidth) * 100;
    let relativeTopPercent = (relativeTop / mapHeight) * 100;
    outlinePercents.push({
      leftPercent: relativeLeftPercent,
      topPercent: relativeTopPercent,
    })
  })

  // Find the bounds of the outline
  let leftPercent = outlinePercents.reduce((min, current) => {
    return current.leftPercent < min ? current.leftPercent : min;
  }, outlinePercents[0].leftPercent);

  let topPercent = outlinePercents.reduce((min, current) => {
    return current.topPercent < min ? current.topPercent : min;
  }, outlinePercents[0].topPercent);

  let rightPercent = outlinePercents.reduce((max, current) => {
    return current.leftPercent > max ? current.leftPercent : max;
  }, outlinePercents[0].leftPercent);

  let bottomPercent = outlinePercents.reduce((max, current) => {
    return current.topPercent > max ? current.topPercent : max;
  }, outlinePercents[0].topPercent);

  // Now, calculate the percentages internally to the div based on the bounds
  let internalPercents = []
  outlinePercents.forEach((outline) => {
    let internalLeftPercent = ((outline.leftPercent - leftPercent) / (rightPercent - leftPercent)) * 100;
    let internalTopPercent = ((outline.topPercent - topPercent) / (bottomPercent - topPercent)) * 100;
    internalPercents.push({
      leftPercent: internalLeftPercent,
      topPercent: internalTopPercent,
    })
  })

  return {
    leftPercent: leftPercent,
    topPercent: topPercent,
    rightPercent: rightPercent,
    bottomPercent: bottomPercent,
    internalPercents: internalPercents,
  };
});

const zoneStyle = computed(() => {
  return {
    position: "absolute",
    top: relativeLocation.value.topPercent + "%",
    left: relativeLocation.value.leftPercent + "%",
    width: relativeLocation.value.rightPercent - relativeLocation.value.leftPercent + "%",
    height: relativeLocation.value.bottomPercent - relativeLocation.value.topPercent + "%",
    "clip-path": "polygon(" + relativeLocation.value.internalPercents.map((point) => {
      return point.leftPercent + "% " + point.topPercent + "%";
    }).join(", ") + ")",
    background: tooltipVisible.value ? "linear-gradient(90deg, rgba(155, 165, 0, 0.5) 0%, rgba(155, 165, 0, 0.5) 100%)" : "linear-gradient(90deg, rgba(255, 165, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)",
    "border-style": "dashed",
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
    zIndex: 100,
  };
});
</script>
<style lang="scss">
.objective-gps-tooltip {
  width: 100%;
}
</style>
