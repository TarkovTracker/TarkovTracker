<template>
  <fitted-card icon="mdi-account-supervisor" icon-color="white" highlight-color="secondary">
    <template #title>
      {{ $t('page.team.card.myteam.title') }}
    </template>
    <template #content>
      <template v-if="systemStore.userTeam == null">
        <v-row align="center" no-gutters>
          <v-col cols="12">
            {{ $t('page.team.card.myteam.no_team') }}
          </v-col>
        </v-row>
      </template>
      <template v-else>
        <v-container>
          <v-row no-gutters>
            <v-col>
              <!-- Show the Team's invite URL -->
              <v-text-field v-model="teamUrl" variant="outlined" label="Team Invite URL" hide-details="auto"
                readonly></v-text-field>
            </v-col>
            <v-col cols="auto">
              <!-- Button to copy the invite URL to clipboard -->
              <v-btn v-if="systemStore.userTeamIsOwn" variant="outlined" class="mx-1" style="height:100%"
                @click="copyUrl">
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <v-container class="align-left mt-2" fluid>
        <v-row align="start">
          <!-- Button to show the new token form -->
          <v-btn v-if="systemStore.userTeam == null" :disabled="creatingTeam" :loading="creatingTeam" variant="outlined"
            class="mx-1" prepend-icon="mdi-account-group" @click="createTeam">
            {{ $t('page.team.card.myteam.create_new_team') }}
          </v-btn>
          <v-btn v-if="systemStore.userTeam != null" :disabled="leavingTeam" :loading="leavingTeam" variant="outlined"
            class="mx-1" prepend-icon="mdi-account-group" @click="leaveTeam">
            {{ systemStore.userTeamIsOwn ? $t('page.team.card.myteam.disband_team') :
                $t('page.team.card.myteam.leave_team')
            }}
          </v-btn>
        </v-row>
      </v-container>
    </template>
  </fitted-card>
  <v-snackbar v-model="createTeamSnackbar" :timeout="4000" color="accent">
    {{ createTeamResult }}
    <template #actions>
      <v-btn color="white" variant="text" @click="createTeamSnackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
  <v-snackbar v-model="leaveTeamSnackbar" :timeout="4000" color="accent">
    {{ leaveTeamResult }}
    <template #actions>
      <v-btn color="white" variant="text" @click="leaveTeamSnackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
<script setup>
import { defineAsyncComponent, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fireapp } from "@/plugins/firebase";
import { useTarkovData } from '@/composables/tarkovdata'
const FittedCard = defineAsyncComponent(() =>
  import("@/components/FittedCard.vue")
)

const { t } = useI18n({ useScope: 'global' })
const { teamStore, systemStore } = useTarkovData()
//const systemStore = useSystemStore();

// Create new team
const creatingTeam = ref(false);
const createTeamResult = ref(null);
const createTeamSnackbar = ref(false);
const createTeam = async () => {
  creatingTeam.value = true;
  try {
    createTeamResult.value = await fireapp.functions().httpsCallable("createTeam")({});
    createTeamResult.value = t('page.team.card.myteam.create_team_success');
    createTeamSnackbar.value = true;
  } catch (error) {
    createTeamResult.value = t('page.team.card.myteam.create_team_error');
    console.error(error)
    createTeamSnackbar.value = true;
  }
  creatingTeam.value = false;
}

// Leave team
const leavingTeam = ref(false);
const leaveTeamResult = ref(null);
const leaveTeamSnackbar = ref(false);
const leaveTeam = async () => {
  leavingTeam.value = true;
  try {
    leaveTeamResult.value = await fireapp.functions().httpsCallable("leaveTeam")({});
    if (systemStore.userTeamIsOwn) {
      leaveTeamResult.value = t('page.team.card.myteam.disband_team_success');
    } else {
      leaveTeamResult.value = t('page.team.card.myteam.leave_team_success');
    }
    leaveTeamSnackbar.value = true;
  } catch (error) {
    leaveTeamResult.value = t('page.team.card.myteam.leave_team_error');
    console.error(error)
    leaveTeamSnackbar.value = true;
  }
  leavingTeam.value = false;
}



const copyUrl = () => {
  if (teamUrl.value) {
    navigator.clipboard.writeText(teamUrl.value);
  } else {
    console.error('No team URL to copy');
  }
}

const teamUrl = computed(() => {
  if (teamStore.teamOwner && teamStore.teamPassword) {
    return `${window.location.href.split('?')[0]}?team=${encodeURIComponent(teamStore.owner)}&code=${encodeURIComponent(teamStore.teamPassword)}`;
  } else {
    return '';
  }

})

</script>
<style lang="scss" scoped>

</style>