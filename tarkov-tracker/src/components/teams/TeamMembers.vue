<template>
  <icon-card
    icon="mdi-account-group"
    icon-background="secondary"
    icon-color="white"
  >
    <template #stat>
      {{ $t("page.team.card.manageteam.title") }}
    </template>
    <template #content>
      <template v-if="teamStore.teamMembers">
        <tracker-tip tip="teammembers" class="text-left"></tracker-tip>
        <v-container>
          <v-row>
            <v-col
              v-for="teammate in teamStore.teamMembers"
              :key="teammate"
              cols="12"
              sm="12"
              md="6"
              lg="4"
              xl="4"
            >
              <teammember-card :teammember="teammate"></teammember-card>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </template>
  </icon-card>
</template>
<script setup>
import { defineAsyncComponent } from "vue";
import { useLiveData } from "@/composables/livedata";
const IconCard = defineAsyncComponent(() =>
  import("@/components/IconCard.vue")
);
const TeammemberCard = defineAsyncComponent(() =>
  import("@/components/teams/TeammemberCard.vue")
);
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
);
const { useTeamStore } = useLiveData();
const teamStore = useTeamStore();
</script>
<style lang="scss" scoped></style>
