<template>
  <div class="d-flex justify-space-between align-center">
    <router-link to="#" @click.prevent="scrollToTask">
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
    </router-link>
    <a
      v-if="props.showWikiLink"
      :href="props.task.wikiLink"
      target="_blank"
      class="wiki-link"
    >
      <v-row no-gutters>
        <v-col cols="auto" class="mr-1">
          <v-icon icon="mdi-information-outline" />
        </v-col>
        <v-col>
          {{ $t("page.tasks.questcard.wiki") }}
        </v-col>
      </v-row>
    </a>
  </div>
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
  showWikiLink: {
    type: Boolean,
    required: false,
    default: false,
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

const scrollToTask = () => {
  const taskCard = document.getElementById(`task-${props.task.id}`);
  taskCard?.scrollIntoView({
    block: "center",
  });
};
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

.wiki-link {
  font-size: 12px;
  white-space: nowrap;
}
</style>
