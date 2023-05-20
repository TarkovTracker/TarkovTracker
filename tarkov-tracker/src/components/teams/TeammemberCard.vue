<template>
  <v-sheet class="pa-2" color="primary" :rounded="true">
    <v-container no-gutters>
      <v-row dense align="center" justify="space-between">
        <v-col cols="auto">
          <div class="text-h4">
            {{ progressStore.teammemberNames[teamStoreId] }}
          </div>
          <div v-if="props.teammember == fireuser.uid">
            <b>
              {{ $t("page.team.card.manageteam.membercard.this_is_you") }}
            </b>
          </div>
        </v-col>
        <v-col align="center" justify="center"> </v-col>
        <v-col cols="auto">
          <!-- <div class="d-flex justify-center align-center">
            <img :src="factionIcon" contain style="max-width: 64px; filter: invert(1)" />
          </div> -->
          <div class="d-flex justify-center align-center">
            <span style="line-height: 0px">
              <img :src="groupIcon" contain style="max-width: 64px;" />
            </span>
            <span>
              <div style="font-size: 0.7em" class="text-center mb-1">
                {{ $t("navigation_drawer.level") }}
              </div>
              <div class="text-center">
                <h1 style="font-size: 2.5em; line-height: 0.8em">
                  {{ progressStore.getLevel(props.teammember) }}
                </h1>
              </div>
            </span>
          </div>
        </v-col>
      </v-row>
      <v-row dense justify="space-between">
        <v-col cols="auto">
          <i18n-t keypath="page.team.card.manageteam.membercard.taskscomplete" scope="global"
            v-if="!userStore.teamIsHidden(props.teammember)">
            <template #completed>
              <b>
                {{ completedTaskCount }}
              </b>
            </template>
            <template #total>
              <b>
                {{ tasks.length }}
              </b>
            </template>
          </i18n-t>
        </v-col>
        <v-col cols="auto">
          <v-btn :disabled="props.teammember == fireuser.uid || userStore.taskTeamAllHidden
            " variant="outlined" :icon="props.teammember != fireuser.uid &&
    userStore.teamIsHidden(props.teammember)
    ? 'mdi-eye-off'
    : 'mdi-eye'
    " class="mx-1" :color="props.teammember != fireuser.uid &&
    userStore.teamIsHidden(props.teammember)
    ? 'red'
    : 'green'
    " size="x-small" @click="userStore.toggleHidden(props.teammember)"></v-btn>
          <!-- Button to delete the token -->
          <v-btn v-if="props.teammember != fireuser.uid && teamStore.isOwner" variant="outlined" icon="mdi-account-minus"
            class="mx-1" color="red" size="x-small" @click="kickTeammate()"></v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>
<script setup>
import { fireuser } from "@/plugins/firebase";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLiveData } from "@/composables/livedata";
import { useUserStore } from "@/stores/user";
import { useProgressStore } from "@/stores/progress";
import { useTarkovData } from "@/composables/tarkovdata";

// Define the props for the component
const props = defineProps({
  teammember: {
    type: String,
    required: true,
  },
});

const teamStoreId = computed(() => {
  if (props.teammember == fireuser.uid) {
    return "self";
  } else {
    return props.teammember;
  }
});

const { useTeamStore } = useLiveData();
const progressStore = useProgressStore();
const teamStore = useTeamStore();
const userStore = useUserStore();
const { tasks } = useTarkovData();

const completedTaskCount = computed(() => {
  return tasks.value.filter(
    (task) =>
      progressStore.tasksCompletions?.[task.id]?.[teamStoreId.value] == true
  ).length;
});

const groupIcon = computed(() => {
  return `/img/levelgroups/${Math.floor(progressStore.getLevel(props.teammember) / 5) + 1
    }.png`;
});

const factionIcon = computed(() => {
  return `/img/factions/${progressStore.getFaction(props.teammember)}.webp`;
});

// const kickTeammate = () => {
//   teamStore.kickTeammate(props.teammember)
// }
// const kickingTeammate = ref(false);
// const kickTeammateResult = ref(null);
// const kickTeammateSnackbar = ref(false);
// const kickTeammate = async () => {
//   creatingTeam.value = true;
//   try {
//     kickTeammateResult.value = await fireapp.functions().httpsCallable("kickTeammate")({});
//     kickTeammateResult.value = t('page.team.card.myteam.create_team_success');
//     kickTeammateSnackbar.value = true;
//   } catch (error) {
//     kickTeammateResult.value = t('page.team.card.myteam.create_team_error');
//     console.error(error)
//     kickTeammateSnackbar.value = true;
//   }
//   creatingTeam.value = false;
// }
</script>
<style lang="scss" scoped></style>
