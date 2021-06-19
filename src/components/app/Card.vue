<template>
  <v-card
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </v-card>
</template>

<script>
  export default { name: 'AppCard' }
</script>
