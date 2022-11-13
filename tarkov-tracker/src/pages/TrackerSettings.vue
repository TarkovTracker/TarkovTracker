<template>
  <v-container>
    <v-row justify="center">
      <v-col
        v-if="fireuser.uid != null"
        cols="12"
        sm="8"
        md="6"
        lg="4"
        xl="4"
      >
        <icon-card icon="mdi-eye" icon-background="secondary" icon-color="white">
          <template #stat>
            {{ $t('page.settings.card.streamermode.title') }}
          </template>
          <template #content>
            {{ $t('page.settings.card.streamermode.description') }}
            <v-container>
              <v-row justify="center">
                <v-col cols="12">
                  <v-switch
                    v-model="streamerMode"
                    hide-details
                    density="compact"
                    :label="streamerMode ? $t('page.settings.card.streamermode.modeOn') : $t('page.settings.card.streamermode.modeOff')"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </icon-card>
      </v-col>
      <v-col
        cols="12"
        sm="8"
        md="6"
        lg="4"
        xl="4"
      >
        <icon-card icon="mdi-gift-open" icon-background="secondary" icon-color="white">
          <template #stat>
            {{ $t('page.settings.card.gameedition.title') }}
          </template>
          <template #content>
            {{ $t('page.settings.card.gameedition.description') }}
            <v-container>
              <v-row justify="center">
                <v-col cols="12">
                  <v-select
                    v-model="currentGameEdition"
                    density="compact"
                    :items="gameEditions"
                    :label="$t('page.settings.card.gameedition.select')"
                    variant="outlined"
                    hide-details
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </icon-card>
      </v-col>
      <v-col
        cols="12"
        sm="8"
        md="6"
        lg="4"
        xl="4"
      >
        <icon-card icon="mdi-restart-alert" icon-background="warning" icon-color="white">
          <template #stat>
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
        </icon-card>
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
const tarkovStore = useTarkovStore();

const gameEditions = [
          { title: 'Standard Edition', value: 1 },
          { title: 'Left Behind Edition', value: 2 },
          { title: 'Prepare for Escape Edition', value: 3 },
          { title: 'Edge of Darkness Limited Edition', value: 4 }
]

const currentGameEdition = computed({
  get() {
    return tarkovStore.value.getGameEdition
  },
  set(newValue) {
    tarkovStore.value.setGameEdition(newValue)
  }
})

const streamerMode = computed({
  get() {
    return tarkovStore.value.getStreamerMode
  },
  set(newValue) {
    tarkovStore.value.setStreamerMode(newValue)
  }
})

</script>
<style lang="scss" scoped>
</style>