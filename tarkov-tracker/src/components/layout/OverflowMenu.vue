<template>
  <v-card min-width="300" class="pa-2">
    <v-container>
      <v-select v-model="currentLocale" prepend-icon="mdi-translate" density="compact" :items="localeItems"
        :label="$t('app_bar.overflow_menu.language')" variant="outlined" hide-details></v-select>
      <v-btn v-if="!userStore.hideAllTips" color="red" prepend-icon="mdi-comment-question-outline" class="mt-4"
        width="100%" @click="enableHideAllTips">
        {{ $t("app_bar.overflow_menu.hide_all_tips") }}
      </v-btn>
      <v-btn v-if="userStore.hiddenTipCount > 0 || userStore.hideAllTips" color="green"
        prepend-icon="mdi-comment-question-outline" class="mt-4" width="100%" @click="unhideTips">
        {{ $t("app_bar.overflow_menu.reset_tips") }}
      </v-btn>
    </v-container>
  </v-card>
</template>
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app.js";
import { useUserStore } from "@/stores/user.js";

const userStore = useUserStore();
const unhideTips = () => {
  userStore.unhideTips();
};
const enableHideAllTips = () => {
  userStore.enableHideAllTips();
};

const appStore = useAppStore();
const { availableLocales, locale } = useI18n({ useScope: "global" });

const localeItems = computed(() => {
  return availableLocales.map((localeCode) => {
    const languageNames = new Intl.DisplayNames([localeCode], {
      type: "language",
    });
    return { title: languageNames.of(localeCode), value: localeCode };
  });
});

const currentLocale = computed({
  get() {
    return localeItems.value.filter(
      (localeItem) => localeItem.value == locale.value
    )[0] || "en";
  },
  // setter
  set(newValue) {
    locale.value = newValue;
    appStore.localeOverride = newValue;
  },
});
</script>
<style lang="scss" scoped></style>
