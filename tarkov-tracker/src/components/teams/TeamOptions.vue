<template>
  <fitted-card
    icon="mdi-account-wrench"
    icon-color="white"
    highlight-color="secondary"
  >
    <template #title>
      {{ $t("page.team.card.teamoptions.title") }}
    </template>
    <template #content>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-switch
              v-model="taskHideAll"
              :label="$t(taskHideAllLabel)"
              inset
              true-icon="mdi-eye-off"
              false-icon="mdi-eye"
              :color="taskHideAllColor"
              hide-details
              density="compact"
            ></v-switch>
            <v-switch
              v-model="itemsHideAll"
              :label="$t(itemsHideAllLabel)"
              inset
              true-icon="mdi-eye-off"
              false-icon="mdi-eye"
              :color="itemsHideAllColor"
              hide-details
              density="compact"
            ></v-switch>
            <v-switch
              v-model="itemsHideNonFIR"
              :disabled="itemsHideAll"
              :label="$t(itemsHideNonFIRLabel)"
              inset
              true-icon="mdi-eye-off"
              false-icon="mdi-eye"
              :color="itemsHideNonFIRColor"
              hide-details
              density="compact"
            ></v-switch>
            <v-switch
              v-model="itemsHideHideout"
              :disabled="itemsHideAll"
              :label="$t(itemsHideHideoutLabel)"
              inset
              true-icon="mdi-eye-off"
              false-icon="mdi-eye"
              :color="itemsHideHideoutColor"
              hide-details
              density="compact"
            ></v-switch>
            <v-switch
              v-model="mapHideAll"
              :label="$t(mapHideAllLabel)"
              inset
              true-icon="mdi-eye-off"
              false-icon="mdi-eye"
              :color="mapHideAllColor"
              hide-details
              density="compact"
            ></v-switch>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </fitted-card>
</template>
<script setup>
import { defineAsyncComponent, computed } from "vue";
import { useUserStore } from "@/stores/user";
const FittedCard = defineAsyncComponent(() =>
  import("@/components/FittedCard.vue")
);
const userStore = useUserStore();

const taskHideAll = computed({
  get: () => userStore.taskTeamAllHidden,
  set: (value) => userStore.setQuestTeamHideAll(value),
});
const taskHideAllLabel = computed(() =>
  userStore.taskTeamAllHidden
    ? "page.team.card.teamoptions.task_hide_all"
    : "page.team.card.teamoptions.task_show_all"
);
const taskHideAllColor = computed(() =>
  userStore.taskTeamAllHidden ? "error" : "success"
);

const itemsHideAll = computed({
  get: () => userStore.itemsTeamAllHidden,
  set: (value) => userStore.setItemsTeamHideAll(value),
});
const itemsHideAllLabel = computed(() =>
  userStore.itemsTeamAllHidden
    ? "page.team.card.teamoptions.items_hide_all"
    : "page.team.card.teamoptions.items_show_all"
);
const itemsHideAllColor = computed(() =>
  userStore.itemsTeamAllHidden ? "error" : "success"
);

const itemsHideNonFIR = computed({
  get: () => userStore.itemsTeamNonFIRHidden,
  set: (value) => userStore.setItemsTeamHideNonFIR(value),
});
const itemsHideNonFIRLabel = computed(() =>
  userStore.itemsTeamNonFIRHidden
    ? "page.team.card.teamoptions.items_hide_non_fir"
    : "page.team.card.teamoptions.items_show_non_fir"
);
const itemsHideNonFIRColor = computed(() =>
  userStore.itemsTeamNonFIRHidden ? "error" : "success"
);

const itemsHideHideout = computed({
  get: () => userStore.itemsTeamHideoutHidden,
  set: (value) => userStore.setItemsTeamHideHideout(value),
});
const itemsHideHideoutLabel = computed(() =>
  userStore.itemsTeamHideoutHidden
    ? "page.team.card.teamoptions.items_hide_hideout"
    : "page.team.card.teamoptions.items_show_hideout"
);
const itemsHideHideoutColor = computed(() =>
  userStore.itemsTeamHideoutHidden ? "error" : "success"
);

const mapHideAll = computed({
  get: () => userStore.mapTeamAllHidden,
  set: (value) => userStore.setMapTeamHideAll(value),
});
const mapHideAllLabel = computed(() =>
  userStore.mapTeamAllHidden
    ? "page.team.card.teamoptions.map_hide_all"
    : "page.team.card.teamoptions.map_show_all"
);
const mapHideAllColor = computed(() =>
  userStore.mapTeamAllHidden ? "error" : "success"
);
</script>
<style lang="scss" scoped></style>
