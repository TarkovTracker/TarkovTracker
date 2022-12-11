<template>
  <icon-card icon="mdi-account-group" icon-background="secondary" icon-color="white">
    <template #stat>
      {{ $t('page.team.card.manageteam.title') }}
    </template>
    <template #content>
      {{ $t('page.team.card.streamermode.description') }}
    </template>
  </icon-card>
</template>
<script setup>
import { defineAsyncComponent } from 'vue'
const IconCard = defineAsyncComponent(() =>
  import("@/components/IconCard.vue")
)

</script>
<style lang="scss" scoped>

</style>