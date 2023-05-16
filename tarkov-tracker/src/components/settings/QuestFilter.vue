<template>
  <fitted-card icon="mdi-filter-cog" icon-color="white">
    <template #title>
      {{ $t("page.settings.card.questfilter.title") }}
    </template>
    <template #content>
      {{ $t("page.settings.card.questfilter.description") }}
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <v-switch
              v-model="hideGlobalTasks"
              :label="$t(hideGlobalTasksLabel)"
              inset
              true-icon="mdi-eye-off"
              false-icon="mdi-eye"
              :color="hideGlobalTasksColor"
              hide-details
              density="compact"
            ></v-switch>
            <v-switch
              v-model="hideNonKappaTasks"
              :label="$t(hideNonKappaTasksLabel)"
              inset
              true-icon="mdi-eye-off"
              false-icon="mdi-eye"
              :color="hideNonKappaTasksColor"
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
import { useI18n } from "vue-i18n";
import { defineAsyncComponent, computed, ref } from "vue";
import { useTarkovStore } from "@/stores/tarkov.js";
import { useUserStore } from "@/stores/user";

const FittedCard = defineAsyncComponent(() =>
  import("@/components/FittedCard.vue")
);

const { t } = useI18n({ useScope: "global" });

const tarkovStore = useTarkovStore();

const userStore = useUserStore();

const hideGlobalTasks = computed({
  get: () => userStore.getHideGlobalTasks,
  set: (value) => userStore.setHideGlobalTasks(value),
});

const hideNonKappaTasks = computed({
  get: () => userStore.getHideNonKappaTasks,
  set: (value) => userStore.setHideNonKappaTasks(value),
});

const hideGlobalTasksLabel = computed(() =>
  hideGlobalTasks.value
    ? "page.settings.card.questfilter.hide_global_tasks"
    : "page.settings.card.questfilter.show_global_tasks"
);
const hideNonKappaTasksLabel = computed(() =>
  hideNonKappaTasks.value
    ? "page.settings.card.questfilter.hide_non_kappa_tasks"
    : "page.settings.card.questfilter.show_non_kappa_tasks"
);
const hideGlobalTasksColor = computed(() =>
  hideGlobalTasks.value ? "error" : "success"
);
const hideNonKappaTasksColor = computed(() =>
  hideNonKappaTasks.value ? "error" : "success"
);
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
