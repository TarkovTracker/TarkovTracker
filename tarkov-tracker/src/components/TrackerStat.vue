<template>
  <v-sheet rounded class="elevation-4 mt-2">
    <v-avatar
      class="ml-2 mb-2 mt-n6 elevation-4 float-left"
      color="accent"
      size="80"
    >
      <v-icon size="64px" color="secondary">{{ props.icon }}</v-icon>
    </v-avatar>
    <div class="text-subtitle text-right pa-2 pb-0">
      <slot name="stat"></slot>
    </div>
    <div class="text-h4 text-right pa-2 pt-0">
      <slot name="value"></slot>
    </div>
    <div
      v-if="$slots.details"
      class="text-left px-3 py-1 text-grey"
      style="font-size: 0.8em"
    >
      <v-divider class="my-1" />
      <v-icon class="mr-1" color="secondary">mdi-help-circle</v-icon
      ><slot name="details"></slot>
    </div>
  </v-sheet>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  icon: {
    type: String,
    default: "mdi-check-all",
    required: false,
  },
});
</script>
<style lang="scss" scoped></style>
