<template>
  <v-sheet
    rounded
    class="elevation-2 pt-2 corner-highlight-parent"
    color="rgba(33,33,33,1)"
  >
    <div class="mt-n10">
      <span class="elevation-3 corner-highlight" :class="highlightClasses">
        <img class="pt-0" :src="stationAvatar" height="50" />
      </span>
      <span class="text-left pb-0">
        <v-sheet rounded class="px-3 py-3" style="display: inherit">
          <span class="text-subtitle-1">{{ station.name }}</span>
          <span class="text-caption ml-3" :hidden="upgradeDisabled">
            <i18n-t
              keypath="page.hideout.stationcard.level"
              scope="global"
              :plural="progressStore.stationLevels[props.station.id]['self']"
            >
              <template #level>
                {{ progressStore.stationLevels[props.station.id]["self"] }}
              </template>
            </i18n-t>
          </span>
        </v-sheet>
      </span>
    </div>

    <div v-if="currentLevel" class="text-center text-caption mt-4 mb-2 mx-2">
      {{ currentLevel.description }}
    </div>
    <div v-else class="text-center text-caption mt-4 mb-2 mx-2">
      {{ nextLevel.description }}
    </div>

    <v-sheet
      v-if="props.station.id == '5d484fc0654e76006657e0ab'"
      class="text-center pa-2"
      color="secondary"
    >
      <div>
        {{ $t("page.hideout.stationcard.gameeditiondescription") }}
      </div>
      <v-btn variant="tonal" to="/settings">{{
        $t("page.hideout.stationcard.settingsbutton")
      }}</v-btn>
    </v-sheet>

    <v-sheet v-if="nextLevel" color="accent" class="mb-1">
      <div class="text-center pa-2">
        <div class="text-subtitle-1 mb-2">
          <v-icon class="mr-2">mdi-package-variant-closed-check</v-icon
          >{{ $t("page.hideout.stationcard.nextlevel") }}
        </div>
        <div
          v-for="(requirement, rIndex) in nextLevel.itemRequirements"
          :key="rIndex"
        >
          <span class="d-flex align-center justify-center">
            <tarkov-item
              :item-id="requirement.item.id"
              :item-name="requirement.item.name"
              :dev-link="requirement.item.link"
              :wiki-link="requirement.item.wikiLink"
              :count="requirement.count"
              class="mr-2 d-inline-block"
            />
          </span>
        </div>
        <div
          v-for="(requirement, rIndex) in nextLevel.stationLevelRequirements"
          :key="rIndex"
        >
          <i18n-t
            keypath="page.hideout.stationcard.requirements.station"
            scope="global"
          >
            <template #level>
              {{ requirement.level }}
            </template>
            <template #stationname>
              {{ requirement.station.name }}
            </template>
          </i18n-t>
        </div>
        <div
          v-for="(requirement, rIndex) in nextLevel.skillRequirements"
          :key="rIndex"
        >
          <i18n-t
            keypath="page.hideout.stationcard.requirements.skill"
            scope="global"
          >
            <template #level>
              {{ requirement.level }}
            </template>
            <template #skillname>
              {{ requirement.name }}
            </template>
          </i18n-t>
        </div>
        <div
          v-for="(requirement, rIndex) in nextLevel.traderRequirements"
          :key="rIndex"
        >
          <i18n-t
            keypath="page.hideout.stationcard.requirements.trader"
            scope="global"
          >
            <template #loyaltylevel>
              {{ requirement.value }}
            </template>
            <template #tradername>
              {{ requirement.trader.name }}
            </template>
          </i18n-t>
        </div>
      </div>
    </v-sheet>
    <v-sheet v-if="!nextLevel" rounded color="accent" class="pa-2">
      <div class="text-center text-subtitle-1">
        <v-icon class="mr-2">mdi-star-check</v-icon
        >{{ $t("page.hideout.stationcard.maxlevel") }}
      </div>
    </v-sheet>

    <div class="mb-2">
      <v-row
        v-if="!upgradeDisabled"
        no-gutters
        class="align-center justify-center"
      >
        <v-col v-if="nextLevel?.level" cols="auto" class="mx-1 my-1">
          <v-btn
            color="green"
            variant="tonal"
            density="comfortable"
            class="my-1"
            @click="upgradeStation()"
          >
            <i18n-t
              keypath="page.hideout.stationcard.upgradebutton"
              scope="global"
              :plural="nextLevel?.level"
            >
              <template #level>
                {{ nextLevel?.level }}
              </template>
            </i18n-t>
          </v-btn>
        </v-col>
        <v-col v-if="currentLevel" cols="auto" class="mx-1 my-1">
          <v-btn
            color="red"
            variant="tonal"
            density="comfortable"
            :disabled="downgradeDisabled"
            class="my-1"
            @click="downgradeStation()"
          >
            <i18n-t
              keypath="page.hideout.stationcard.downgradebutton"
              scope="global"
              :plural="
                progressStore.stationLevels[props.station.id]['self'] - 1
              "
            >
              <template #level>
                {{ progressStore.stationLevels[props.station.id]["self"] - 1 }}
              </template>
            </i18n-t>
          </v-btn>
        </v-col>
      </v-row>
      <v-row
        v-if="upgradeDisabled"
        no-gutters
        class="align-center justify-center"
      >
        <v-col cols="auto" class="mx-1 my-1">
          <span class="mx-3">
            {{ t("page.hideout.stationcard.upgradeunavailable") }}</span
          >
        </v-col>
      </v-row>
    </div>
    <v-snackbar v-model="moduleStatusUpdated" :timeout="4000" color="secondary">
      {{ moduleStatus }}
      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="moduleStatusUpdated = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-sheet>
</template>
<script setup>
import { computed, defineAsyncComponent, ref } from "vue";
import { useProgressStore } from "@/stores/progress";
import { useI18n } from "vue-i18n";
import { useTarkovStore } from "@/stores/tarkov";
const TarkovItem = defineAsyncComponent(() =>
  import("@/components/TarkovItem.vue")
);
const props = defineProps({
  station: {
    type: Object,
    required: true,
  },
});
const progressStore = useProgressStore();
const tarkovStore = useTarkovStore();
const { t } = useI18n({ useScope: "global" });

const highlightClasses = computed(() => {
  let classes = {};
  if (progressStore.stationLevels[props.station.id]["self"] > 0) {
    classes["highlight-secondary"] = true;
  } else {
    classes["highlight-green"] = true;
  }
  return classes;
});

const upgradeDisabled = computed(() => {
  return !Object.values(progressStore.visibleStations).find(
    (station) => station.id === props.station.id
  );
});

const downgradeDisabled = computed(() => {
  if (props.station.id == "5d484fc0654e76006657e0ab") {
    if (
      progressStore.stationLevels[props.station.id]["self"] <=
      progressStore.gameEditionData.find(
        (edition) => edition.version == tarkovStore.getGameEdition
      ).defaultStashLevel
    ) {
      return true;
    }
  }
  return false;
});

const moduleStatusUpdated = ref(false);
const moduleStatus = ref("");

const upgradeStation = () => {
  // Store next level to a variable because it can change mid-function
  let upgradeLevel = nextLevel.value;
  tarkovStore.setHideoutModuleComplete(upgradeLevel.id);
  // For each objective, mark it as complete
  upgradeLevel.itemRequirements.forEach((o) => {
    tarkovStore.setHideoutPartComplete(o.id);
  });
  moduleStatus.value = t("page.hideout.stationcard.statusupgraded", {
    name: props.station.name,
    level: upgradeLevel.level,
  });
  moduleStatusUpdated.value = true;
};

const downgradeStation = () => {
  // Store current level to a variable because it can change mid-function
  let downgradeLevel = currentLevel.value;
  tarkovStore.setHideoutModuleUncomplete(downgradeLevel.id);
  // For each objective, mark it as incomplete
  downgradeLevel.itemRequirements.forEach((o) => {
    tarkovStore.setHideoutPartUncomplete(o.id);
  });
  moduleStatus.value = t("page.hideout.stationcard.statusdowngraded", {
    name: props.station.name,
    level: downgradeLevel.level,
  });
  moduleStatusUpdated.value = true;
};

const nextLevel = computed(() => {
  return (
    props.station.levels.find(
      (level) =>
        level.level ===
        progressStore.stationLevels[props.station.id]["self"] + 1
    ) || null
  );
});

const currentLevel = computed(() => {
  return (
    props.station.levels.find(
      (level) =>
        level.level === progressStore.stationLevels[props.station.id]["self"]
    ) || null
  );
});

const stationAvatar = computed(() => {
  return `/img/hideout/${props.station.id}.png`;
});
</script>
<style lang="scss" scoped>
.corner-highlight {
  border-right-style: solid;
  border-right-width: 0px;
  border-bottom-style: solid;
  border-bottom-width: 0px;
  margin: 0px;
  padding: 6px;
  background-clip: padding-box;
  border-radius: 10px 10px 10px 0px;
}

.highlight-secondary {
  background: linear-gradient(
    135deg,
    rgba(125, 111, 85, 1) 0%,
    rgba(172, 157, 128, 1) 35%,
    rgba(154, 136, 102, 1) 100%
  );
}

.highlight-green {
  background: linear-gradient(
    90deg,
    rgba(1, 36, 0, 0.15) 0%,
    rgba(15, 121, 9, 0.15) 35%,
    rgba(0, 83, 0, 0.15) 100%
  );
}
</style>
