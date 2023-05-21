<template>
  <tracker-tip tip="neededitems"></tracker-tip>
  <v-container>
    <v-row align="center" dense>
      <v-col cols="12" sm="12" md="3" lg="3">
        <!-- Primary views (all, maps, traders) -->
        <v-card>
          <v-tabs v-model="activeNeededView" bg-color="accent" slider-color="secondary" align-tabs="center" show-arrows>
            <v-tab v-for="(view, index) in neededViews" :key="index" :value="view.view" :prepend-icon="view.icon">
              {{ view.title }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
      <v-col cols="9" sm="10" md="8" lg="8">
        <v-text-field v-model="itemFilterNameText" label="Search by item name" variant="solo" hide-details
          density="comfortable"></v-text-field>
      </v-col>
      <v-col cols="3" sm="2" md="1" lg="1">
        <v-dialog v-model="settingsDialog" scrim="#9A8866">
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="tonal" style="width: 100%; height: 48px" class="px-0">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </template>
          <v-row class="justify-center">
            <v-col cols="auto">
              <v-card :title="$t('page.neededitems.options.title')" style="width: fit-content">
                <v-card-text>
                  <v-container class="ma-0 pa-0">
                    <v-row dense>
                      <!-- Choose needed items layout style -->
                      <v-col cols="12">
                        <v-btn-toggle v-model="neededItemsStyle" rounded="0" group variant="outlined">
                          <v-btn value="mediumCard" icon="mdi-view-grid">
                          </v-btn>

                          <v-btn value="smallCard" icon="mdi-view-comfy">
                          </v-btn>

                          <v-btn value="row" icon="mdi-view-sequential">
                          </v-btn>
                        </v-btn-toggle>
                      </v-col>
                      <!-- Hide Task Items that aren't needed found in raid option-->
                      <v-col cols="12">
                        <v-switch v-model="hideFIR" :label="$t(hideFIRLabel)" inset true-icon="mdi-eye-off"
                          false-icon="mdi-eye" :color="hideFIRColor" hide-details density="compact"></v-switch>
                        <v-switch v-model="itemsHideAll" :label="$t(itemsHideAllLabel)" inset true-icon="mdi-eye-off"
                          false-icon="mdi-eye" :color="itemsHideAllColor" hide-details density="compact"></v-switch>
                        <v-switch v-model="itemsHideNonFIR" :disabled="itemsHideAll" :label="$t(itemsHideNonFIRLabel)"
                          inset true-icon="mdi-eye-off" false-icon="mdi-eye" :color="itemsHideNonFIRColor" hide-details
                          density="compact"></v-switch>
                        <v-switch v-model="itemsHideHideout" :disabled="itemsHideAll" :label="$t(itemsHideHideoutLabel)"
                          inset true-icon="mdi-eye-off" false-icon="mdi-eye" :color="itemsHideHideoutColor" hide-details
                          density="compact"></v-switch>
                      </v-col>

                    </v-row>
                    <v-row justify="end">
                      <v-col cols="12" md="6">
                        <v-btn color="primary" block @click="settingsDialog = false">{{
                          $t("page.neededitems.options.close") }}</v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-dialog>
      </v-col>
    </v-row>
    <v-row v-if="loading || hideoutLoading" justify="center">
      <v-col cols="12" align="center">
        <v-progress-circular indeterminate color="secondary" class="mx-2"></v-progress-circular>
        {{ $t("page.neededitems.loading") }} <refresh-button />
      </v-col>
    </v-row>
    <v-row v-show="activeNeededView == 'all' || activeNeededView == 'tasks'" justify="space-between">
      <needed-item v-for="(neededItem, itemIndex) in neededTaskItems" :key="itemIndex" :need="neededItem"
        :itemStyle="neededItemsStyle" />
    </v-row>
    <v-row v-show="activeNeededView == 'all' || activeNeededView == 'hideout'" justify="space-between">
      <needed-item v-for="(neededItem, itemIndex) in neededHideoutItems" :key="itemIndex" :need="neededItem"
        :itemStyle="neededItemsStyle" />
    </v-row>
  </v-container>
</template>
<script setup>
import { computed, provide, ref, watch } from "vue";
import { useTarkovData } from "@/composables/tarkovdata";
import { useProgressStore } from "@/stores/progress";
import { defineAsyncComponent } from "vue";
import { debounce } from "lodash-es";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
);
const RefreshButton = defineAsyncComponent(() =>
  import("@/components/RefreshButton.vue")
);
const NeededItem = defineAsyncComponent(() =>
  import("@/components/neededitems/NeededItem.vue")
);
const { t } = useI18n({ useScope: "global" });
const {
  tasks,
  hideoutModules,
  hideoutLoading,
  loading,
  neededItemTaskObjectives,
  neededItemHideoutModules,
} = useTarkovData();
const progressStore = useProgressStore();
const userStore = useUserStore();

const itemFilterNameText = ref("");
const itemFilterName = ref("");
provide("itemFilterName", itemFilterName);

watch(
  itemFilterNameText,
  debounce((newVal) => {
    itemFilterName.value = newVal;
  }, 500)
);

const neededItemsStyle = computed({
  get: () => userStore.getNeededItemsStyle,
  set: (value) => userStore.setNeededItemsStyle(value),
});

const settingsDialog = ref(false);

const neededViews = [
  {
    title: t("page.neededitems.neededviews.all"),
    icon: "mdi-all-inclusive",
    view: "all",
  },
  {
    title: t("page.neededitems.neededviews.tasks"),
    icon: "mdi-clipboard-text",
    view: "tasks",
  },
  {
    title: t("page.neededitems.neededviews.hideout"),
    icon: "mdi-home",
    view: "hideout",
  },
];

const activeNeededView = computed({
  get: () => userStore.getNeededTypeView,
  set: (value) => userStore.setNeededTypeView(value),
});

const neededTaskItems = computed(() => {
  return JSON.parse(JSON.stringify(neededItemTaskObjectives.value)).sort(
    (a, b) => {
      let aCount = 0;
      tasks.value
        .find((task) => task.id == a.taskId)
        .predecessors.forEach((predecessor) => {
          // Check if the predecessor is completed
          if (
            progressStore.tasksCompletions?.[predecessor]?.["self"] === false
          ) {
            aCount++;
          }
        });

      let bCount = 0;
      tasks.value
        .find((task) => task.id == b.taskId)
        .predecessors.forEach((predecessor) => {
          // Check if the predecessor is completed
          if (
            progressStore.tasksCompletions?.[predecessor]?.["self"] === false
          ) {
            bCount++;
          }
        });
      if (aCount > bCount) {
        return 1;
      } else if (aCount < bCount) {
        return -1;
      }
      return 0;
    }
  );
});

const neededHideoutItems = computed(() => {
  let hideoutNeeds = JSON.parse(
    JSON.stringify(neededItemHideoutModules.value)
  ).sort((a, b) => {
    let aCount = 0;
    hideoutModules.value
      .find((hModule) => hModule.id == a.hideoutModule.id)
      .predecessors.forEach((predecessor) => {
        // Check if the predecessor is completed
        if (
          progressStore.moduleCompletions?.[predecessor]?.["self"] === false
        ) {
          aCount++;
        }
      });

    let bCount = 0;
    hideoutModules.value
      .find((hModule) => hModule.id == b.hideoutModule.id)
      .predecessors.forEach((predecessor) => {
        // Check if the predecessor is completed
        if (
          progressStore.moduleCompletions?.[predecessor]?.["self"] === false
        ) {
          bCount++;
        }
      });
    if (aCount > bCount) {
      return 1;
    } else if (aCount < bCount) {
      return -1;
    }
    return 0;
  });
  return hideoutNeeds;
});

const hideFIR = computed({
  get: () => userStore.itemsNeededHideNonFIR,
  set: (value) => userStore.setItemsNeededHideNonFIR(value),
});
const hideFIRLabel = computed(() =>
  userStore.itemsNeededHideNonFIR
    ? "page.neededitems.options.items_hide_non_fir"
    : "page.neededitems.options.items_show_non_fir"
);
const hideFIRColor = computed(() =>
  userStore.itemsNeededHideNonFIR ? "error" : "success"
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
</script>
<style lang="scss" scoped></style>
