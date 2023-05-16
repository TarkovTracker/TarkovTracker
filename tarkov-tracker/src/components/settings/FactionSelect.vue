<template>
  <fitted-card icon="mdi-castle" icon-color="white">
    <template #title>
      {{ $t("page.settings.card.pmcfaction.title") }}
    </template>
    <template #content>
      {{ $t("page.settings.card.pmcfaction.description") }}
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <v-select
              v-model="currentPMCFaction"
              density="compact"
              :items="PMCFactions"
              :label="$t('page.settings.card.pmcfaction.select')"
              variant="outlined"
              hide-details
              :active="factionMenuActive"
            >
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-img
                      :src="factionImage(item.value)"
                      width="1.5em"
                      class="faction-invert mr-1"
                    />
                  </template>
                </v-list-item>
              </template>
              <template v-slot:prepend-inner>
                <v-img
                  :src="factionImage(currentPMCFaction)"
                  width="1em"
                  class="faction-invert ma-1"
                />
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </fitted-card>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { defineAsyncComponent, computed, ref } from "vue";
import { useTarkovStore } from "@/stores/tarkov.js";

const FittedCard = defineAsyncComponent(() =>
  import("@/components/FittedCard.vue")
);

const { t } = useI18n({ useScope: "global" });

const tarkovStore = useTarkovStore();

const PMCFactions = [
  { title: t("page.settings.card.pmcfaction.factions.USEC"), value: "USEC" },
  { title: t("page.settings.card.pmcfaction.factions.BEAR"), value: "BEAR" },
];

const factionMenuActive = ref(true);

const setFaction = (faction) => {
  currentPMCFaction.value = faction;
  factionMenuActive.value = false;
};

const factionImage = (faction) => {
  return `img/factions/${faction}.webp`;
};

const currentPMCFaction = computed({
  get() {
    return tarkovStore.getPMCFaction;
  },
  set(newValue) {
    tarkovStore.setPMCFaction(newValue);
  },
});
</script>
<style lang="scss" scoped>
a:link,
a:active,
a:visited {
  color: rgba(var(--v-theme-link), 1);
}

.faction-invert {
  filter: invert(1);
}

.info-link {
  text-decoration: none;
}
</style>
