<template>
  <div>
    <b>Objective ID:</b> {{ objective?.id }}
  </div>
  <div>
    <b>Objective Description:</b> {{ objective?.description }}
  </div>
  <div :style="objectiveMaps.length > 1 ? 'background-color: red' : ''">
    <v-row align="center">
      <v-col cols="auto">
        <b>Objective Maps:</b>
      </v-col>
      <v-col cols="auto">
        <v-btn icon size="x-small" @click="mapEditor = !mapEditor">
          <v-icon>{{ mapEditor ? 'mdi-close' : 'mdi-pencil' }}</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="7">
        <template v-if="mapEditor">
          <v-autocomplete
v-model="objectiveMaps" label="Autocomplete" :items="maps" item-title="name" item-value="id"
            multiple variant="solo"></v-autocomplete>
        </template>
        <template v-else>
          <span>{{ objectiveMapString }}</span>
        </template>
      </v-col>
    </v-row>
  </div>
</template>
<script setup>
import { inject, computed, ref } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
import { defineAsyncComponent } from 'vue'
import { useEditorStore } from '@/stores/editor'
const props = defineProps({
  objective: {
    type: Object,
    required: true,
  }
})
const editorStore = useEditorStore()
const { tasks, rawMaps: maps, traders } = useTarkovData()

const mapEditor = ref(false)

const objectiveMaps = computed({
  get() {
    if (editorStore.getObjectiveMaps(props.objective.id)?.length > 0) {
      return editorStore.getObjectiveMaps(props.objective.id).map(m => maps.value.find(map => map.id == m))
    } else {
      return props.objective?.maps || []
    }
  },
  set(newMaps) {
    editorStore.setObjectiveMaps(props.objective.id, newMaps)
  }
})

const objectiveMapString = computed(() => {
  return objectiveMaps.value.map(m => m.name).join(', ')
})

</script>
<style lang="scss" scoped>

</style>