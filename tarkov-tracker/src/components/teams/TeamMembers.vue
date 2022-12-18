<template>
  <icon-card icon="mdi-account-group" icon-background="secondary" icon-color="white">
    <template #stat>
      {{ $t('page.team.card.manageteam.title') }}
    </template>
    <template #content>
      <template v-if="teamStore.teamMembers">
        <template v-for="teammate in teamStore.teamMembers" :key="teammate">
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

const { teamStore } = useTarkovData()

</script>
<style lang="scss" scoped>

</style>