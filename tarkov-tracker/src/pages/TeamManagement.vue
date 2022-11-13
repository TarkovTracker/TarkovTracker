<template>
  <v-container>
    <v-row justify="center">
      <v-col
        v-if="fireuser.uid != null"
        cols="12"
      >
        <icon-card icon="mdi-account-group" icon-background="secondary" icon-color="white">
          <template #stat>
            {{ $t('page.team.card.manageteam.title') }}
          </template>
          <template #content>
            {{ $t('page.team.card.streamermode.description') }}
            <v-container>
              <v-row justify="center">
                <v-col cols="12">
                  <v-switch
                    v-model="streamerMode"
                    hide-details
                    density="compact"
                    :label="streamerMode ? $t('page.team.card.streamermode.modeOn') : $t('page.team.card.streamermode.modeOff')"
                  ></v-switch>
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