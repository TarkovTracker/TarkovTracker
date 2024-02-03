<template>
  <v-container>
    <v-row justify="center">
      <v-col v-if="fireuser.loggedIn" cols="12" sm="12" md="12" lg="12" xl="12">
        <fitted-card icon="mdi-key-chain" icon-color="white">
          <template #title>
            {{ $t("page.settings.card.apitokens.title") }}
          </template>
          <template #content>
            <i18n-t keypath="page.settings.card.apitokens.description" scope="global">
              <template #openAPI_documentation>
                <a href="https://tarkovtracker.github.io/TarkovTracker/" target="_blank" class="info-link">
                  <v-icon class="mr-1" size="16">mdi-file-document</v-icon>{{
                    $t("page.settings.card.apitokens.openAPI_documentation")
                  }}
                </a>
              </template>
            </i18n-t>
            <api-tokens />
          </template>
        </fitted-card>
      </v-col>
      <v-col v-else cols="12" sm="12" md="12" lg="12" xl="12">
        <fitted-card icon="mdi-key-chain" icon-color="white">
          <template #title>
            {{ $t("page.settings.card.apitokens.title") }}
          </template>
          <template #content>
            <i18n-t keypath="page.settings.card.apitokens.description" scope="global">
              <template #openAPI_documentation>
                <a href="https://tarkovtracker.github.io/TarkovTracker/" target="_blank" class="info-link">
                  <v-icon class="mr-1" size="16">mdi-file-document</v-icon>{{
                    $t("page.settings.card.apitokens.openAPI_documentation")
                  }}
                </a>
              </template>
            </i18n-t>
            <v-row justify="center">
              <v-col cols="12">
                <v-alert dense outlined type="error" :value="true" class="ma-2">
                  {{
                    $t("page.settings.card.apitokens.not_logged_in")
                  }}
                </v-alert>
              </v-col>
            </v-row>
          </template>
        </fitted-card>
      </v-col>
      <v-col v-if="fireuser.loggedIn" cols="12" sm="12" md="6" lg="4" xl="4">
        <fitted-card icon="mdi-eye" icon-color="white">
          <template #title>
            {{ $t("page.settings.card.streamermode.title") }}
          </template>
          <template #content>
            {{ $t("page.settings.card.streamermode.description") }}
            <v-container>
              <v-row justify="center">
                <v-col cols="12">
                  <v-switch v-model="streamerMode" hide-details density="compact" :label="streamerMode
                    ? $t('page.settings.card.streamermode.modeOn')
                    : $t('page.settings.card.streamermode.modeOff')
                    ">
                  </v-switch>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </fitted-card>
      </v-col>
      <v-col cols="12" sm="12" md="6" lg="4" xl="4">
        <quest-filter />
      </v-col>
      <v-col cols="12" sm="12" md="6" lg="4" xl="4">
        <faction-select />
      </v-col>
      <v-col cols="12" sm="12" md="6" lg="4" xl="4">
        <fitted-card icon="mdi-gift-open" icon-color="white">
          <template #title>
            {{ $t("page.settings.card.gameedition.title") }}
          </template>
          <template #content>
            {{ $t("page.settings.card.gameedition.description") }}
            <v-container>
              <v-row justify="center">
                <v-col cols="12">
                  <v-select v-model="currentGameEdition" density="compact" :items="gameEditions"
                    :label="$t('page.settings.card.gameedition.select')" variant="outlined" hide-details></v-select>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </fitted-card>
      </v-col>
      <v-col cols="12" sm="12" md="6" lg="4" xl="4">
        <fitted-card icon="mdi-restart-alert" icon-color="white">
          <template #title>
            {{ $t("page.settings.card.reset.title") }}
          </template>
          <template #content>
            {{ $t("page.settings.card.reset.description") }}
            <v-container>
              <v-row justify="center">
                <v-col cols="auto">
                  <v-dialog v-model="resetDialog">
                    <template #activator="{ props }">
                      <v-btn color="warning" prepend-icon="mdi-alert" v-bind="props">
                        {{ $t("page.settings.card.reset.button") }}
                      </v-btn>
                    </template>
                    <v-row class="justify-center">
                      <v-col cols="auto">
                        <v-card :title="$t('page.settings.card.reset.confirmtitle')" style="width: fit-content">
                          <v-card-text>
                            <v-container class="ma-0 pa-0">
                              <v-row no-gutters>
                                <v-col cols="12">
                                  {{
                                    $t("page.settings.card.reset.confirmation")
                                  }}
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col cols="12" md="6">
                                  <v-btn color="red" block prepend-icon="mdi-alert" @click="
                                  tarkovStore.$reset();
                                  resetDialog = false;
                                  ">
                                    {{
                                      $t(
                                        "page.settings.card.reset.confirmresetbutton"
                                      )
                                    }}
                                  </v-btn>
                                </v-col>
                                <v-col cols="12" md="6">
                                  <v-btn color="primary" block @click="resetDialog = false">{{
                                    $t(
                                      "page.settings.card.reset.confirmcancelbutton"
                                    )
                                  }}</v-btn>
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
            </v-container>
          </template>
        </fitted-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { fireuser } from "@/plugins/firebase";
import { defineAsyncComponent, computed, ref } from "vue";
import { useTarkovStore } from "@/stores/tarkov.js";
import { useUserStore } from "@/stores/user.js";
const FittedCard = defineAsyncComponent(() =>
  import("@/components/FittedCard.vue")
);
const ApiTokens = defineAsyncComponent(() =>
  import("@/components/settings/ApiTokens.vue")
);
const FactionSelect = defineAsyncComponent(() =>
  import("@/components/settings/FactionSelect.vue")
);
const QuestFilter = defineAsyncComponent(() =>
  import("@/components/settings/QuestFilter.vue")
);
const tarkovStore = useTarkovStore();
const userStore = useUserStore();

const resetDialog = ref(false);

const gameEditions = [
  { title: "Standard Edition", value: 1 },
  { title: "Left Behind Edition", value: 2 },
  { title: "Prepare for Escape Edition", value: 3 },
  { title: "Edge of Darkness Limited Edition", value: 4 },
];

const currentGameEdition = computed({
  get() {
    return tarkovStore.getGameEdition;
  },
  set(newValue) {
    tarkovStore.setGameEdition(newValue);
  },
});

const streamerMode = computed({
  get() {
    return userStore.getStreamerMode;
  },
  set(newValue) {
    userStore.setStreamerMode(newValue);
  },
});
</script>
<style lang="scss" scoped>
a:link,
a:active,
a:visited {
  color: rgba(var(--v-theme-link), 1);
}

.info-link {
  text-decoration: none;
}
</style>
