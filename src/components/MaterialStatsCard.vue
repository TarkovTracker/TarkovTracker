<template>
  <material-card
    class="v-card--material-stats"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #subtitle>
      <div
        class="text-right text-h3"
        v-text="value"
      />
    </template>

    <template #actions>
      <slot name="actions" />
    </template>

    <slot />
  </material-card>
</template>

<script>
  export default {
    name: 'MaterialStatCard',

    props: { value: String }
  }
</script>

<style lang="sass">
.v-card--material-stats.v-card--material
  border: 1px solid var(--v-accent-darken2)
  .v-card--material__title
    font-size: .875rem !important
    margin-left: auto
    text-align: right
  .v-card--material__sheet
    border: 1px solid
    border-color: var(--v-accent-darken2) !important
  .v-icon
    color: var(--v-secondary-base)
</style>
