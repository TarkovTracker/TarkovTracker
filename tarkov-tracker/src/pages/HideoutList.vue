<template>
  <tracker-tip tip="hideout"></tracker-tip>
  <v-container>
    <v-row justify="center">
      <v-col lg="4" md="12">
        <v-card>
          <v-tabs v-model="activePrimaryView" bg-color="accent" slider-color="secondary" align-tabs="center" show-arrows>
            <v-tab v-for="(view, index) in primaryViews" :key="index" :value="view.view" :prepend-icon="view.icon">
              {{ view.title }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-container>
    <v-row v-if="hideoutLoading" justify="center">
      <v-col cols="12" align="center">
        <v-progress-circular indeterminate color="secondary" class="mx-2"></v-progress-circular>
        {{ $t("page.hideout.loading") }} <refresh-button />
      </v-col>
    </v-row>
    <v-row justify="center" class="mt-2">
      <v-col v-for="(hStation, hIndex) in visibleStations" :key="hIndex" cols="12" sm="12" md="6" lg="6" xl="4">
        <hideout-card :station="hStation" class="ma-2" />
      </v-col>
    </v-row>
    <v-row v-if="!hideoutLoading && visibleStations.length == 0">
      <v-col cols="12">
        <v-alert icon="mdi-clipboard-search">
          {{ $t("page.hideout.nostationsfound") }}</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTarkovData } from "@/composables/tarkovdata";
import { useProgressStore } from "@/stores/progress";
import { useUserStore } from "@/stores/user";
import { defineAsyncComponent } from "vue";
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
);
const HideoutCard = defineAsyncComponent(() =>
  import("@/components/hideout/HideoutCard.vue")
);
const RefreshButton = defineAsyncComponent(() =>
  import("@/components/RefreshButton.vue")
);
const { t } = useI18n({ useScope: "global" });
const { hideoutStations, hideoutLoading } = useTarkovData();
const progressStore = useProgressStore();
const userStore = useUserStore();

const primaryViews = [
  {
    title: t("page.hideout.primaryviews.available"),
    icon: "mdi-tag-arrow-up-outline",
    view: "available",
  },
  {
    title: t("page.hideout.primaryviews.maxed"),
    icon: "mdi-arrow-collapse-up",
    view: "maxed",
  },
  {
    title: t("page.hideout.primaryviews.locked"),
    icon: "mdi-lock",
    view: "locked",
  },
  {
    title: t("page.hideout.primaryviews.all"),
    icon: "mdi-clipboard-check",
    view: "all",
  },
];

const activePrimaryView = computed({
  get: () => userStore.getTaskPrimaryView,
  set: (value) => userStore.setTaskPrimaryView(value),
});

const visibleStations = computed(() => {
  let hideoutStationList = JSON.parse(JSON.stringify(hideoutStations.value));
  let visibleStations = progressStore.visibleStations;

  //Display all upgradeable stations
  if (activePrimaryView.value === "available")
    return Object.values(visibleStations).filter(
      (station) =>
        progressStore.stationLevels[station.id]["self"] !==
        station.levels.length
    );

  //Display all maxed stations
  if (activePrimaryView.value === "maxed")
    return hideoutStationList.filter(
      (station) =>
        progressStore.stationLevels[station.id]["self"] ===
        station.levels.length
    );

  //Display all locked stations
  if (activePrimaryView.value === "locked")
    return hideoutStationList.filter(
      (station) =>
        !Object.values(visibleStations).some((s) => s.id === station.id)
    );

  //Display all stations
  if (activePrimaryView.value === "all") return hideoutStationList;

  return visibleStations;
});
</script>
<style lang="scss" scoped></style>
