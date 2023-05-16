<template>
  <v-sheet rounded class="elevation-2 mt-2">
    <v-avatar
      class="ml-2 mb-2 mt-n4 mr-2 elevation-2 float-left"
      :color="props.iconBackground"
      size="64"
    >
      <v-icon size="48px" :color="props.iconColor">{{ props.icon }}</v-icon>
    </v-avatar>
    <div class="text-h5 text-left pa-2 pb-0">
      <slot name="stat"></slot>
    </div>
    <div class="text-center pa-2 pt-6">
      <slot name="content"></slot>
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
  iconBackground: {
    type: String,
    default: "accent",
    required: false,
  },
  iconColor: {
    type: String,
    default: "secondary",
    required: false,
  },
});
</script>
<style lang="scss" scoped></style>
