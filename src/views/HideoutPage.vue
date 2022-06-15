<template>
  <v-container
    id="tabs-view"
    fluid
    tag="section"
  >
    <v-responsive
      max-width="1200"
      class="mx-auto"
    >
      <div class="text-center my-10">
        <v-tabs
          v-model="activeHideoutTab"
          :active-class="`success white--text`"
          background-color="transparent"
          class="v-tabs--pill"
          centered
          hide-slider
        >
          <v-tab
            class="mr-3"
            to="/hideout/current"
            exact
            replace
          >
            <v-icon class="mr-2">
              mdi-home
            </v-icon>
            Current
          </v-tab>
          <v-tab
            class="mr-3"
            to="/hideout/available"
            exact
            replace
          >
            <v-icon class="mr-2">
              mdi-hammer-wrench
            </v-icon>
            Available
          </v-tab>
          <v-tab
            to="/hideout/locked"
            exact
            replace
          >
            <v-icon class="mr-2">
              mdi-lock
            </v-icon>
            Locked
          </v-tab>
        </v-tabs>
        <router-view :availability="availability" />
      </div>
    </v-responsive>
  </v-container>
</template>

<script>
  export default {
    props: {
      availability: {
        type: String
      }
    },
    data () {
      return {
        activeHideoutTab: 0
      }
    },
    metaInfo: {
      // Children can override the title.
      title: 'Hideout',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Track needed items & progression routes for upgrading your hideout in Escape From Tarkov.' }
      ]
    },
    methods: {
    }
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
