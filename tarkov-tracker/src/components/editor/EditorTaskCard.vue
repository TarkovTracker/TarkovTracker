<template>
  <v-card>
    <v-card-title>
      <div>
        ID: {{ task?.id }}
      </div>
      <div>
        Name: {{ task?.name }}
      </div>
    </v-card-title>
    <v-card-text>
      <div>
        <a :href="task.wikiLink" target="_blank" class="wiki-link">Wiki link</a>
      </div>
      <div>
        <div
v-for="objective, objIndex in task?.objectives" :key="objective.id" class="pa-1"
          :style="objIndex % 2 == 1 ? 'background-color: #2f2f2f' : 'background-color: #1b1b1b'">
          <editor-objective-section :objective="objective" />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { inject, computed } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
import { defineAsyncComponent } from 'vue'
const EditorObjectiveSection = defineAsyncComponent(() =>
  import("@/components/editor/EditorObjectiveSection.vue")
)
const props = defineProps({
  task: {
    type: Object,
    required: true,
  }
})
const { tasks, rawMaps: maps, traders } = useTarkovData()


</script>
<style lang="scss" scoped>

</style>