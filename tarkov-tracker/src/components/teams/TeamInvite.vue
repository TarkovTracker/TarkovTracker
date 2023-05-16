<template>
  <v-alert
    v-if="!inInviteTeam && !declined"
    color="green"
    theme="dark"
    icon="mdi-handshake"
    density="compact"
    prominent
  >
    <div class="d-flex flex-row align-center justify-space-between">
      <div>
        {{ $t("page.team.card.teaminvite.description") }}
      </div>
      <div>
        <v-btn
          class="mx-1 my-1"
          variant="outlined"
          :disabled="accepting"
          :loading="accepting"
          @click="acceptInvite"
        >
          {{ $t("page.team.card.teaminvite.accept") }}
        </v-btn>
        <v-btn
          variant="outlined"
          :disabled="accepting"
          @click="declined = true"
        >
          {{ $t("page.team.card.teaminvite.decline") }}
        </v-btn>
      </div>
    </div>
  </v-alert>
  <v-snackbar v-model="joinTeamSnackbar" :timeout="4000" color="accent">
    {{ joinResult }}

    <template #actions>
      <v-btn color="white" variant="text" @click="joinTeamSnackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { fireapp } from "@/plugins/firebase";
import { useLiveData } from "@/composables/livedata";

const { useSystemStore } = useLiveData();
const systemStore = useSystemStore();
const { t } = useI18n({ useScope: "global" });
const route = useRoute();
const inInviteTeam = computed(() => {
  return (
    systemStore?.userTeam != null && systemStore.userTeam == route?.query?.team
  );
});
const declined = ref(false);

const accepting = ref(false);

const joinTeamSnackbar = ref(false);
const joinResult = ref("");

const acceptInvite = async () => {
  // If the user is already in the team, do nothing
  if (inInviteTeam.value) {
    return;
  }

  // Mark the process as started
  accepting.value = true;

  // If the user is already in a team, leave it first
  if (systemStore.userTeam != null) {
    try {
      const leaveResult = await fireapp
        .functions()
        .httpsCallable("leaveTeam")();
      if (leaveResult.data.error) {
        throw new Error(leaveResult.data);
      }
    } catch (error) {
      console.debug("Error while leaving team", JSON.stringify(error));
      joinResult.value = t("page.team.card.teaminvite.leave_error");
      joinTeamSnackbar.value = true;
      return;
    }
  }

  // Join the team
  try {
    const joinResult = await fireapp.functions().httpsCallable("joinTeam")({
      id: route?.query?.team,
      password: route?.query?.code,
    });
    if (joinResult.data.error) {
      throw new Error(joinResult.data);
    }
    joinResult.value = t("page.team.card.teaminvite.join_success");
    joinTeamSnackbar.value = true;
    accepting.value = false;
    // Get rid of the invite code from the URL by navigating to the team page with no query/params
    const router = useRouter();
    router.push({ name: "team" });
  } catch (error) {
    console.debug("Error while joining team", JSON.stringify(error));
    joinResult.value = t("page.team.card.teaminvite.join_error");
    joinTeamSnackbar.value = true;
  }
};
</script>
<style lang="scss" scoped></style>
