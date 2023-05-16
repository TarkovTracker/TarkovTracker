<template>
  <v-row dense>
    <v-col cols="12"> <b>Objective ID:</b> {{ objective?.id }} </v-col>
    <v-col cols="12"> <b>Description:</b> {{ objective?.description }} </v-col>
    <v-col cols="12">
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <v-icon class="mr-2">mdi-map</v-icon><b>Maps:</b>
        </v-col>
        <v-col cols="auto" class="mx-2">
          <v-btn
            variant="tonal"
            class="pa-1"
            size="small"
            @click="mapEditor = !mapEditor"
          >
            <v-icon>{{ mapEditor ? "mdi-content-save" : "mdi-pencil" }}</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="7">
          <template v-if="mapEditor">
            <v-autocomplete
              v-model="objectiveMaps"
              label="Autocomplete"
              :items="maps"
              item-title="name"
              item-value="id"
              multiple
              variant="solo"
            ></v-autocomplete>
          </template>
          <template v-else>
            <span>{{ objectiveMapString }}</span>
          </template>
        </v-col>
      </v-row>
    </v-col>
    <v-col v-if="validGPS == true" cols="12">
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <v-icon class="mr-2">mdi-crosshairs-gps</v-icon><b>GPS:</b>
        </v-col>
        <v-col cols="auto" class="mx-2">
          <v-btn
            variant="tonal"
            class="pa-1"
            size="small"
            @click="gpsEditor = !gpsEditor"
          >
            <v-icon>{{ gpsEditor ? "mdi-content-save" : "mdi-pencil" }}</v-icon>
          </v-btn>
        </v-col>
        <v-col v-if="objectiveMarkers.length > 0" cols="auto" class="mx-2">
          <v-btn
            variant="tonal"
            class="pa-1"
            size="small"
            @click="clearObjectiveMarker()"
          >
            Clear Marker
          </v-btn>
        </v-col>
        <v-col cols="7">
          <template v-if="gpsEditor">
            <tarkov-map
              :map="gpsMap"
              :marks="objectiveMarkers"
              @gpsclick="catchGPS"
            />
          </template>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script setup>
import { inject, computed, ref, watch } from "vue";
import { useTarkovData } from "@/composables/tarkovdata";
import { defineAsyncComponent } from "vue";
import { useEditorStore } from "@/stores/editor";
const TarkovMap = defineAsyncComponent(() =>
  import("@/components/TarkovMap.vue")
);
const props = defineProps({
  objective: {
    type: Object,
    required: true,
  },
});
const editorStore = useEditorStore();
const { tasks, rawMaps: maps, maps: processedMaps, traders } = useTarkovData();

// Watch procesedMaps to see changes
// watch(processedMaps, (newMaps) => {
//   console.log(newMaps)
// }, { immediate: true })

const mapEditor = ref(false);
const gpsEditor = ref(false);

const objectiveMaps = computed({
  get() {
    if (editorStore.getObjectiveMaps(props.objective.id)?.length > 0) {
      return editorStore
        .getObjectiveMaps(props.objective.id)
        .map((m) => maps.value.find((map) => map.id == m));
    } else {
      return (
        props.objective?.maps.map((m) =>
          maps.value.find((map) => map.id == m)
        ) || []
      );
    }
  },
  set(newMaps) {
    editorStore.setObjectiveMaps(props.objective.id, newMaps);
  },
});

const catchGPS = (gps) => {
  editorStore.setObjectiveGPS(props.objective.id, gps);
};

const clearObjectiveMarker = () => {
  editorStore.setObjectiveGPS(props.objective.id, undefined);
};

const objectiveMarkers = computed(() => {
  if (editorStore.getObjectiveGPS(props.objective.id)) {
    return [editorStore.getObjectiveGPS(props.objective.id)];
  } else {
    return [];
  }
});

const properMaps = computed(() => {
  let finalMaps = {};
  objectiveMaps.value.forEach((map) => {
    if (typeof map == "string") {
      finalMaps[map] = processedMaps.value.find((m) => m.id == map);
    } else {
      if (map.id == "59fc81d786f774390775787e") {
        finalMaps["55f2d3fd4bdc2d5f408b4567"] = processedMaps.value.find(
          (m) => m.id == "55f2d3fd4bdc2d5f408b4567"
        );
      } else {
        finalMaps[map.id] = processedMaps.value.find((m) => m.id == map.id);
      }
    }
  });
  // Remove any maps from finalMaps that have duplicate IDS

  return Object.values(finalMaps);
});

const validGPS = computed(() => {
  if (properMaps.value.length == 1) {
    return true;
  } else {
    return false;
  }
});

const gpsMap = computed(() => {
  if (validGPS.value == true) {
    if (properMaps.value.length == 1) {
      return properMaps.value[0];
    } else {
      return {};
    }
  } else {
    return {};
  }
});

// const validGPS = computed(() => {
//   if (objectiveMaps.value.length == 1) {
//     if (objectiveMaps.value[0] == '59fc81d786f774390775787e') {
//       // Were night factory, so use factory instead
//       return processedMaps.value.find(map => map.id = '55f2d3fd4bdc2d5f408b4567')
//     } else {
//       return processedMaps.value.find(map => map.id == objectiveMaps.value[0].id)
//     }
//   } else if (objectiveMaps.value.length == 2) {
//     // If there are two maps, and they are factory and night factory, use factory
//     try {
//       if (objectiveMaps.value.includes('55f2d3fd4bdc2d5f408b4567') && objectiveMaps.value.includes('59fc81d786f774390775787e')) {
//         return processedMaps.value.find(map => map.id = '55f2d3fd4bdc2d5f408b4567')
//       } else if (objectiveMaps.value.map(m => m.id).includes('55f2d3fd4bdc2d5f408b4567') && objectiveMaps.value.map(m => m.id).includes('59fc81d786f774390775787e')) {
//         return processedMaps.value.find(map => map.id = '55f2d3fd4bdc2d5f408b4567')
//       } else {
//         return false
//       }
//     } catch {
//       return false
//     }
//   } else {
//     return false
//   }
// })

const objectiveMapString = computed(() => {
  return objectiveMaps.value
    .map((m) =>
      typeof m == "string"
        ? processedMaps.value.find((map) => m == map.id).name
        : m.name
    )
    .join(", ");
});
</script>
<style lang="scss" scoped></style>
