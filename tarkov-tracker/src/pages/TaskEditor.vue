<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-btn class="mr-1" @click="editorStore.reset()"
          >Reset Editor Store</v-btn
        >
        <!-- Copy the objectiveMaps to clipboard -->
        <v-btn class="mr-1" @click="copyObjectiveMaps()"
          >Copy Objective Maps JSON</v-btn
        >
        <v-btn class="mr-1" @click="copyAlternativeTasks()"
          >Copy Alternative Tasks JSON</v-btn
        >
        <v-btn class="mr-1" @click="copyGPSLocations()"
          >Copy GPS Locations JSON</v-btn
        >
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col v-for="task in allTasks" :key="task.id" cols="12">
        <v-lazy
          :options="{
            threshold: 0.5,
          }"
          min-height="50"
        >
          <editor-task-card :task="task" />
        </v-lazy>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { computed, ref } from "vue";
import { useTarkovData } from "@/composables/tarkovdata";
import { defineAsyncComponent } from "vue";
import { useEditorStore } from "@/stores/editor";
const EditorTaskCard = defineAsyncComponent(() =>
  import("@/components/editor/EditorTaskCard.vue")
);
const editorStore = useEditorStore();

const { tasks, maps, traders } = useTarkovData();

const updatedTasks = ref({});

const allTasks = computed({
  get() {
    return JSON.parse(JSON.stringify(tasks.value));
  },
  set(newTasks) {
    updatedTasks.value = newTasks;
  },
});

const copyObjectiveMaps = async () => {
  navigator.clipboard.writeText(
    JSON.stringify(editorStore.getObjectiveMapsFull, null, 2)
  );
};

const copyAlternativeTasks = async () => {
  navigator.clipboard.writeText(
    JSON.stringify(editorStore.getAlternativeTasksFull, null, 2)
  );
};

const copyGPSLocations = async () => {
  navigator.clipboard.writeText(
    JSON.stringify(editorStore.getObjectiveGPSFull, null, 2)
  );
};
</script>
<style lang="scss" scoped></style>
