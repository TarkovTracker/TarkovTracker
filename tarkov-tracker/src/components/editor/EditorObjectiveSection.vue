<template>
  <v-row dense>
    <v-col cols="12">
      <b>Objective ID:</b> {{ objective?.id }}
    </v-col>
    <v-col cols="12">
      <b>Description:</b> {{ objective?.description }}
    </v-col>
    <v-col cols="12">
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <b>Maps:</b>
        </v-col>
        <v-col cols="auto" class="mx-2">
          <v-btn variant="tonal" class="pa-1" size="small" @click="mapEditor = !mapEditor">
            <v-icon>{{ mapEditor ? 'mdi-content-save' : 'mdi-pencil' }}</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="7">
          <template v-if="mapEditor">
            <v-autocomplete v-model="objectiveMaps" label="Autocomplete" :items="maps" item-title="name" item-value="id"
              multiple variant="solo"></v-autocomplete>
          </template>
          <template v-else>
            <span>{{ objectiveMapString }}</span>
          </template>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12" v-if="validGPS">
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <b>GPS:</b>
        </v-col>
        <v-col cols="auto" class="mx-2">
          <v-btn variant="tonal" class="pa-1" size="small" @click="gpsEditor = !gpsEditor">
            <v-icon>{{ gpsEditor ? 'mdi-content-save' : 'mdi-pencil' }}</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="7">
          <template v-if="gpsEditor">
            <tarkov-map :map="validGPS" @gpsclick="catchGPS" />
          </template>
          <template v-else>
            <span>Test No Editor</span>
          </template>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script setup>
import { inject, computed, ref } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
import { defineAsyncComponent } from 'vue'
import { useEditorStore } from '@/stores/editor'
const TarkovMap = defineAsyncComponent(() => import('@/components/TarkovMap.vue'))
const props = defineProps({
  objective: {
    type: Object,
    required: true,
  }
})
const editorStore = useEditorStore()
const { tasks, rawMaps: maps, maps: processedMaps, traders } = useTarkovData()

const mapEditor = ref(false)
const gpsEditor = ref(false)

const objectiveMaps = computed({
  get() {
    if (editorStore.getObjectiveMaps(props.objective.id)?.length > 0) {
      return editorStore.getObjectiveMaps(props.objective.id).map(m => maps.value.find(map => map.id == m))
    } else {
      return props.objective?.maps.map(m => maps.value.find(map => map.id == m)) || []
    }
  },
  set(newMaps) {
    editorStore.setObjectiveMaps(props.objective.id, newMaps)
  }
})

const catchGPS = (gps) => {
  console.log(gps)
}

const validGPS = computed(() => {
  if (objectiveMaps.value.length == 1) {
    if (objectiveMaps.value[0] == '59fc81d786f774390775787e') {
      // Were night factory, so use factory instead
      return processedMaps.value.find(map => map.id = '55f2d3fd4bdc2d5f408b4567')
    } else {
      return processedMaps.value.find(map => map.id == objectiveMaps.value[0].id)
    }
  } else {
    return false
  }
})

const objectiveMapString = computed(() => {
  return objectiveMaps.value.map(m => typeof m == 'string' ? processedMaps.value.find(map => m == map.id).name : m.name).join(', ')
})

</script>
<style lang="scss" scoped>

</style>