<template>
  <v-row align="center">
    <v-col cols="auto">
      <b>Alternative Quests:</b>
    </v-col>
    <v-col cols="auto">
      <v-btn
        icon
        size="x-small"
        @click="alternativeEditor = !alternativeEditor"
      >
        <v-icon>{{ alternativeEditor ? "mdi-close" : "mdi-pencil" }}</v-icon>
      </v-btn>
    </v-col>
    <v-col cols="7">
      <template v-if="alternativeEditor">
        <v-autocomplete
          v-model="taskAlternatives"
          label="Alternative Quests"
          :items="tasks"
          item-title="name"
          item-value="id"
          multiple
          variant="solo"
        ></v-autocomplete>
      </template>
      <template v-else>
        <span>{{ alternativeTaskString }}</span>
      </template>
    </v-col>
  </v-row>
</template>
<script setup>
import { computed, ref } from "vue";
import { useTarkovData } from "@/composables/tarkovdata";
import { useEditorStore } from "@/stores/editor";
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});
const editorStore = useEditorStore();
const { tasks, rawMaps: maps, traders } = useTarkovData();

const alternativeEditor = ref(false);

const taskAlternatives = computed({
  get() {
    if (editorStore.getAlternativeTasks(props.task.id)?.length > 0) {
      return editorStore
        .getAlternativeTasks(props.task.id)
        .map((m) => tasks.value.find((task) => task.id == m));
    } else {
      return [];
    }
  },
  set(newAlternatives) {
    editorStore.setAlternativeTasks(props.task.id, newAlternatives);
  },
});

const alternativeTaskString = computed(() => {
  return taskAlternatives.value.map((m) => m.name).join(", ");
});
</script>
<style lang="scss" scoped></style>
