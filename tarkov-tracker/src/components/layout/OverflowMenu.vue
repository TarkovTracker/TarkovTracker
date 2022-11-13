<template>
  <v-card min-width="300" class="pa-2">
    <v-container>
      <v-select
        v-model="currentLocale"
        prepend-icon="mdi-translate"
        density="compact"
        :items="localeItems"
        :label="$t('app_bar.overflow_menu.language')"
        variant="outlined"
        hide-details
      ></v-select>
    </v-container>
  </v-card>
</template>
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from "@/stores/app.js";

const appStore = useAppStore();
const { availableLocales, locale } = useI18n({ useScope: 'global' })

const localeItems = computed(() => {
  return availableLocales.map((localeCode) => {
    const languageNames = new Intl.DisplayNames([localeCode], {
      type: 'language'
    });
    return {title: languageNames.of(localeCode), value: localeCode}
  })
})

const currentLocale = computed({
  get() {
    return localeItems.value.filter(localeItem => localeItem.value == locale.value)[0]
  },
  // setter
  set(newValue) {
    locale.value = newValue
    appStore.localeOverride = newValue
  }
})
</script>
<style lang="scss" scoped>
</style>