<template>
  <v-sheet class="pa-2" color="primary" :rounded="true">
    <v-container no-gutters>
      <v-row dense align="center" justify="space-between">
        <v-col cols="auto">
          <div class="text-h4">
            {{
                progressStore.getDisplayName(props.teammember)
            }}
          </div>
          <div v-if="props.teammember == fireuser.uid">
            <b>
              {{
                  $t('page.team.card.manageteam.membercard.this_is_you')
              }}
            </b>
          </div>
        </v-col>
        <v-col align="center" justify="center">

        </v-col>
        <v-col cols="auto">
          <div class="d-flex justify-center align-center">
            <span style="line-height:0px">
              <img :src="groupIcon" contain style="max-width:64px">
            </span>
            <span>
              <div style="font-size:.7em" class="text-center mb-1">
                {{ $t('navigation_drawer.level') }}
              </div>
              <div class="text-center">
                <h1 style="font-size:2.5em; line-height:0.8em;">
                  {{ progressStore.getLevel(props.teammember) }}
                </h1>
              </div>
            </span>
          </div>
        </v-col>
      </v-row>
      <v-row dense justify="end">
        <v-col cols="auto">
          <v-btn :disabled="props.teammember == fireuser.uid || userStore.questTeamAllHidden" variant="outlined"
            :icon="props.teammember != fireuser.uid && userStore.teamIsHidden(props.teammember) ? 'mdi-eye-off' : 'mdi-eye'"
            class="mx-1"
            :color="props.teammember != fireuser.uid && userStore.teamIsHidden(props.teammember) ? 'red' : 'green'"
            size="x-small" @click="userStore.toggleHidden(props.teammember)"></v-btn>
          <!-- Button to delete the token -->
          <v-btn v-if="props.teammember != fireuser.uid && teamStore.isOwner" variant="outlined" icon="mdi-delete"
            class="mx-1" color="secondary" size="x-small"></v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>
<script setup>
import { fireuser } from "@/plugins/firebase";
import { doc, getDoc } from 'firebase/firestore'
import { defineProps, computed, onMounted } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLiveData } from '@/composables/livedata'
import { useUserStore } from '@/stores/user'

// Get locale for use in calculating relative time
const { locale } = useI18n({ useScope: 'global' })

// Define the props for the component
const props = defineProps({
  teammember: {
    type: String,
    required: true,
  }
})

const { useProgressStore, useTeamStore } = useLiveData()
const progressStore = useProgressStore()
const teamStore = useTeamStore()
const userStore = useUserStore()

const groupIcon = computed(() => { return `/img/levelgroups/${Math.floor(progressStore.getLevel(props.teammember) / 5) + 1}.png` })

</script>
<style lang="scss" scoped>

</style>