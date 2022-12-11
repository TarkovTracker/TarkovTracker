<template>
  <fitted-card icon="mdi-account-wrench" icon-color="white" highlight-color="secondary">
    <template #title>
      {{ $t('page.team.card.teamoptions.title') }}
    </template>
    <template #content>
      {{ $t('page.team.card.streamermode.description') }}
    </template>
  </fitted-card>
</template>
<script setup>
import { defineAsyncComponent } from 'vue'
const FittedCard = defineAsyncComponent(() =>
  import("@/components/FittedCard.vue")
)

</script>
<style lang="scss" scoped>

</style>