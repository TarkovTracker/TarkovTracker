<template>
  <v-tabs
    :active-class="`${color} ${theme.isDark ? 'black' : 'white'}--text`"
    class="v-tabs--pill"
    hide-slider
    v-bind="$attrs"
    background-color="transparent"
    v-on="$listeners"
  >
    <slot />

    <slot name="items" />
  </v-tabs>
</template>

<script>
  export default {
    name: 'AppTabs',

    inject: ['theme'],

    props: {
      color: {
        type: String,
        default: 'primary',
      },
    },
  }
</script>

<style lang="sass">
  .v-tabs--pill
    .v-tab,
    .v-tab:before
      border-radius: 24px

    &.v-tabs--icons-and-text
      &:not(.v-tabs--vertical) > .v-tabs-bar
        height: 100px
      .v-tab,
      .v-tab:before
        border-radius: 4px
</style>
