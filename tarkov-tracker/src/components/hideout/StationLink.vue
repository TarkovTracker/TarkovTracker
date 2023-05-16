<template>
  <router-link to="/">
    <div class="d-flex">
      <v-img
        :src="stationIcon"
        max-height="24"
        max-width="24"
        style="vertical-align: middle"
      />
      <span class="ml-2 font-weight-bold">
        {{ props.station?.name }}
      </span>
    </div>
  </router-link>
</template>
<script setup>
import { computed } from "vue";
// Define the props for the component
const props = defineProps({
  station: {
    type: Object,
    required: true,
  },
});

const stationIcon = computed(() => {
  return `/img/hideout/${props.station.id}.png`;
});
</script>
<style lang="scss" scoped>
a:any-link {
  color: rgba(var(--v-theme-tasklink), 1) !important;
  text-decoration: none;
}
</style>
