<template>
  <v-app-bar
    id="default-app-bar"
    app
    absolute
    class="v-bar--underline"
    color="transparent"
    :clipped-left="$vuetify.rtl"
    :clipped-right="!$vuetify.rtl"
    height="70"
    flat
  >
    <v-app-bar-nav-icon
      class="hidden-md-and-up"
      @click="drawer = !drawer"
    />

    <default-drawer-toggle class="hidden-sm-and-down" />

    <v-toolbar-title
      class="font-weight-light text-h5"
      v-text="currentRouteName"
    />

    <v-spacer />

    <tracker-hint class="hidden-sm-and-down text-caption" />

    <v-spacer />

    <default-search class="hidden-sm-and-down mt-4" />
  </v-app-bar>
</template>

<script>
  // Utilities
  import { sync } from 'vuex-pathify'

  export default {
    name: 'DefaultBar',

    components: {
      DefaultDrawerToggle: () => import(
        /* webpackChunkName: "default-drawer-toggle" */
        './widgets/DrawerToggle'
      ),
      DefaultSearch: () => import(
        /* webpackChunkName: "default-search" */
        './widgets/Search'
      )
    },

    computed: {
      ...sync('app', [
        'drawer',
        'mini'
      ]),
      currentRouteName () {
        return this.$route.name
      }
    }
  }
</script>
