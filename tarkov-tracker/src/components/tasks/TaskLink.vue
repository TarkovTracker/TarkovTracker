<template>
  <router-link to="/">
    <div class="d-flex">
      <v-avatar size="1.5em" style="vertical-align: middle">
        <v-img :src="traderAvatar" />
      </v-avatar>
      <template v-if="isFactionTask">
        <v-avatar
          size="1.5em"
          rounded="0"
          style="vertical-align: middle"
          class="ml-2"
        >
          <v-img :src="factionImage" class="faction-icon" />
        </v-avatar>
      </template>
      <span class="ml-2 font-weight-bold">
        {{ props.task?.name }}
      </span>
    </div>
  </router-link>
</template>
<script setup>
import { computed } from "vue";
import { useTarkovData } from "@/composables/tarkovdata";
// Define the props for the component
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const { tasks } = useTarkovData();

// Check if there are two faction tasks for this task
const isFactionTask = computed(() => {
  return props.task?.factionName != "Any";
});

const factionImage = computed(() => {
  return `/img/factions/${props.task.factionName}.webp`;
});

const traderAvatar = computed(() => {
  return `/img/traders/${props.task?.trader?.id}.jpg`;
});
</script>
<style lang="scss" scoped>
a:any-link {
  color: rgba(var(--v-theme-tasklink), 1) !important;
  text-decoration: none;
}

.faction-icon {
  filter: invert(1);
  max-width: 24px;
  max-height: 24px;
}
</style>
