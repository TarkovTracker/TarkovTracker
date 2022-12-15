<template>
  <icon-card icon="mdi-account-group" icon-background="secondary" icon-color="white">
    <template #stat>
      {{ $t('page.team.card.manageteam.title') }}
      {{ team?.owner ? team?.owner : 'No owner' }}
    </template>
    <template #content>
      <template v-if="team?.members">
        <template v-for="teammate in team?.members" :key="teammate">
          {{ teammate }}
        </template>
      </template>
    </template>
  </icon-card>
</template>
<script setup>
import { defineAsyncComponent } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
const IconCard = defineAsyncComponent(() =>
  import("@/components/IconCard.vue")
)

const { team } = useTarkovData()

</script>
<style lang="scss" scoped>

</style>