<template>
  <icon-card
    icon="mdi-account-group"
    icon-background="#242F35"
    icon-color="#9A8866"
  >
    <template #stat>
      {{ $t("module.team_settings.title") }}
    </template>
    <template #content>
      {{ $t("module.team_settings.description") }}
      <v-container>
        <v-row justify="center">
          <v-col cols="12"> Test </v-col>
        </v-row>
      </v-container>
    </template>
  </icon-card>
</template>

<script setup>
import { defineAsyncComponent } from "vue";
const IconCard = defineAsyncComponent(() =>
  import("@/components/IconCard.vue")
);
</script>
<style lang="scss" scoped></style>
