<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <template v-for="(floor, floorIndex) in props.map.svg.floors" :key="floorIndex">
          <v-btn variant="tonal" :color="floor == selectedFloor ? 'green' : ''" class="mx-2" @click="setFloor(floor)">{{
            floor.replace("_", " ") }}</v-btn>
        </template>
      </v-col>
      <v-col cols="12">
        <div :id="randomMapId" style="position: relative; width: 100%">
          <template v-for="(mark, markIndex) in props.marks" :key="markIndex">
            <template v-for="(markLocation, markLocationIndex) in mark.possibleLocations" :key="markLocationIndex">
              <map-marker v-if="markLocation.map.id === props.map.id" :key="markLocationIndex" :mark="mark"
                :mark-location="markLocation" :selected-floor="selectedFloor" :map="props.map" />
            </template>
            <template v-for="(zoneLocation, zoneLocationIndex) in mark.zones" :key="zoneLocationIndex">
              <map-zone v-if="zoneLocation.map.id === props.map.id" :key="zoneLocationIndex" :mark="mark"
                :zone-location="zoneLocation" :selected-floor="selectedFloor" :map="props.map" />
            </template>
          </template>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import {
  defineProps,
  computed,
  ref,
  onMounted,
  defineAsyncComponent,
  watch,
} from "vue";
import { useUserStore } from "@/stores/user.js";
import { v4 as uuidv4 } from "uuid";
import * as d3 from "d3";
const randomMapId = ref(uuidv4());
const emit = defineEmits(["gpsclick"]);
const props = defineProps({
  map: {
    type: Object,
    required: true,
  },
  marks: {
    type: Array,
    required: false,
  },
});
const MapMarker = defineAsyncComponent(() =>
  import("@/components/MapMarker.vue")
);
const MapZone = defineAsyncComponent(() => import("@/components/MapZone.vue"));

// selectedFloor is a ref which defaults to the last item in the floors array
const selectedFloor = ref(
  props.map.svg.floors[props.map.svg.floors.length - 1]
);

const setFloor = (floor) => {
  selectedFloor.value = floor;
  draw();
};

watch(
  () => props.map,
  () => {
    draw();
    selectedFloor.value = props.map.svg.floors[props.map.svg.floors.length - 1];
  }
);

const draw = async () => {
  const svg = await d3.svg(
    `https://tarkovtracker.github.io/tarkovdata/maps/${props.map.svg.file}`
  );
  d3.select(document.getElementById(randomMapId.value))
    .selectAll("svg")
    .remove();
  d3.select(document.getElementById(randomMapId.value))
    .node()
    .appendChild(svg.documentElement);
  d3.select(document.getElementById(randomMapId.value))
    .select("svg")
    .style("width", "100%");
  d3.select(document.getElementById(randomMapId.value))
    .select("svg")
    .style("height", "100%");
  // Calculate the index of the selected floor
  const selectedFloorIndex = props.map.svg.floors.indexOf(selectedFloor.value);
  props.map.svg.floors.forEach((floor, index) => {
    if (index > selectedFloorIndex) {
      d3.select(document.getElementById(randomMapId.value))
        .select("svg")
        .select(`#${floor}`)
        .style("opacity", 0.02);
    }
  }, this);
};

onMounted(() => {
  draw();
});

const userStore = useUserStore();
</script>
<style lang="scss" scoped></style>
