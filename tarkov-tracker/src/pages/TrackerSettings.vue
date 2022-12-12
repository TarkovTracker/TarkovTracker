<template>
  <v-container>
    <v-row justify="center">
      <v-col v-if="fireuser.loggedIn" cols="12" sm="12" md="12" lg="12" xl="12">
        <fitted-card icon="mdi-key-chain" icon-color="white">
          <template #title>
            {{ $t('page.settings.card.apitokens.title') }}
          </template>
          <template #content>
            <i18n-t keypath="page.settings.card.apitokens.description" scope="global">
              <template #openAPI_documentation>
                <a href="https://tarkovtracker.github.io/TarkovTracker/" target="_blank" class="info-link">
                  <v-icon class="mr-1" size="16">mdi-file-document</v-icon>{{
                      $t('page.settings.card.apitokens.openAPI_documentation')
                  }}
                </a>
              </template>
            </i18n-t>
            <api-tokens />
          </template>
        </fitted-card>
      </v-col>
      <v-col v-if="fireuser.loggedIn" cols="12" sm="12" md="6" lg="4" xl="4">
        <fitted-card icon="mdi-eye" icon-color="white">
          <template #title>
            {{ $t('page.settings.card.streamermode.title') }}
          </template>
          <template #content>
            {{ $t('page.settings.card.streamermode.description') }}
            <v-container>
              <v-row justify="center">
                <v-col cols="12">
                  <v-switch v-model="streamerMode" hide-details density="compact"
                    :label="streamerMode ? $t('page.settings.card.streamermode.modeOn') : $t('page.settings.card.streamermode.modeOff')">
                  </v-switch>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </fitted-card>
      </v-col>
      <v-col cols="12" sm="12" md="6" lg="4" xl="4">
        <fitted-card icon="mdi-gift-open" icon-color="white">
          <template #title>
            {{ $t('page.settings.card.gameedition.title') }}
          </template>
          <template #content>
            {{ $t('page.settings.card.gameedition.description') }}
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
            {{ $t('page.settings.card.reset.title') }}
          </template>
          <template #content>
            {{ $t('page.settings.card.reset.description') }}
            <v-container>
              <v-row justify="center">
                <v-col cols="auto">
                  <v-btn color="warning" prepend-icon="mdi-alert" @click="tarkovStore.$reset()">
                    {{ $t('page.settings.card.reset.button') }}
                  </v-btn>
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
import { fireuser } from '@/plugins/firebase'
import { defineAsyncComponent, computed } from 'vue'
import { useTarkovStore } from "@/stores/tarkov.js";
const IconCard = defineAsyncComponent(() =>
  import("@/components/IconCard.vue")
)
const FittedCard = defineAsyncComponent(() =>
  import("@/components/FittedCard.vue")
)
const ApiTokens = defineAsyncComponent(() =>
  import("@/components/settings/ApiTokens.vue")
)
const tarkovStore = useTarkovStore();

const gameEditions = [
  { title: 'Standard Edition', value: 1 },
  { title: 'Left Behind Edition', value: 2 },
  { title: 'Prepare for Escape Edition', value: 3 },
  { title: 'Edge of Darkness Limited Edition', value: 4 }
]

const currentGameEdition = computed({
  get() {
    return tarkovStore.getGameEdition
  },
  set(newValue) {
    tarkovStore.setGameEdition(newValue)
  }
})

const streamerMode = computed({
  get() {
    return tarkovStore.getStreamerMode
  },
  set(newValue) {
    tarkovStore.setStreamerMode(newValue)
  }
})

</script>
<style lang="scss" scoped>
a:link,
a:active,
a:visited {
  color: rgba(var(--v-theme-link), 1)
}

.info-link {
  text-decoration: none;
}
</style>