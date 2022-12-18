<template>
  <v-alert v-if="!inInviteTeam && !declined" color="green" theme="dark" icon="mdi-handshake" density="compact"
    prominent>
    <div class="d-flex flex-row align-center justify-space-between">
      <div>
        {{ $t('page.team.card.teaminvite.description') }}
      </div>
      <div>
        <v-btn class="mx-1 my-1" variant="outlined" :disabled="accepting" :loading="accepting" @click="acceptInvite">
          {{ $t('page.team.card.teaminvite.accept') }}
        </v-btn>
        <v-btn variant="outlined" @click="declined = true" :disabled="accepting">
          {{ $t('page.team.card.teaminvite.decline') }}
        </v-btn>
      </div>
    </div>
  </v-alert>
</template>
<script setup>
import { defineAsyncComponent, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTarkovData } from '@/composables/tarkovdata'
const IconCard = defineAsyncComponent(() =>
  import("@/components/IconCard.vue")
)

const route = useRoute()
const { teamStore, systemStore } = useTarkovData()
const inInviteTeam = computed(() => {
  return systemStore.userTeam != null && systemStore.userTeam == route?.query?.team
})
const declined = ref(false)

const accepting = ref(false)

const acceptInvite = () => {
  accepting.value = true
  // If the user is already in a team, leave it first
  if (systemStore.userTeam != null) {
    teamStore.leaveTeam(systemStore.userTeam)
  }
}

</script>
<style lang="scss" scoped>

</style>