<template>
  <tracker-tip tip="neededitems"></tracker-tip>
  {{ JSON.stringify(neededQuestItems) }}
</template>
<script setup>
import { computed, ref } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
import { useProgressStore } from '@/stores/progress'
import { defineAsyncComponent } from 'vue'
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
)
const { tasks, maps, traders, hideoutStations, hideoutLoading } = useTarkovData()
const progressStore = useProgressStore()

const neededQuestItems = computed(() => {
  return progressStore.neededQuestItems
})

</script>
<style lang="scss" scoped>

</style>