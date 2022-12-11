<template>
  <fitted-card icon="mdi-account-wrench" icon-color="white" highlight-color="secondary">
    <template #title>
      {{ $t('page.team.card.myteam.title') }}
    </template>
    <template #content>
      <v-container class="align-left" fluid>
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
</template>
<script setup>
import { defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fireapp } from "@/plugins/firebase";
import { useSystemStore } from "@/stores/system.js";
const FittedCard = defineAsyncComponent(() =>
  import("@/components/FittedCard.vue")
)

const { t } = useI18n({ useScope: 'global' })
const systemStore = useSystemStore();

// Create new team
const creatingTeam = ref(false);
const createTeamResult = ref(null);
const newTeamSnackbar = ref(false);
const createTeam = async () => {
  try {
    createTeamResult.value = await fireapp.functions().httpsCallable("createTeam")({});
    createTeamResult.value = t('page.team.card.myteam.create_team_success');
    newTeamSnackbar.value = true;
  } catch (error) {
    createTeamResult.value = t('page.team.card.myteam.create_team_error');
    console.error(error)
    newTeamSnackbar.value = true;
  }
}

// Leave team
const leavingTeam = ref(false);
const leaveTeam = async () => {
  try {
    createTeamResult.value = await fireapp.functions().httpsCallable("leaveTeam")({});
    if (systemStore.userTeamIsOwn) {
      createTeamResult.value = t('page.team.card.myteam.disband_team_success');
    } else {
      createTeamResult.value = t('page.team.card.myteam.leave_team_success');
    }
    newTeamSnackbar.value = true;
  } catch (error) {
    createTeamResult.value = t('page.team.card.myteam.leave_team_error');
    console.error(error)
    newTeamSnackbar.value = true;
  }
}

</script>
<style lang="scss" scoped>

</style>