<template>
  <v-app :style="{background: $vuetify.theme.themes[theme].background}">
    <default-bar />
    <v-img
      src="/img/CheckpointFade.jpg"
      dark
      gradient="to top, #00000075, #00000075"
      min-height="100vh"
      :height="$vuetify.breakpoint.mdAndUp ? '100vh' : undefined"
    >
      <div
        :class="[$vuetify.breakpoint.mdAndUp && 'fill-height']"
        class="d-block d-md-flex"
      >

        <default-drawer
          :miniOverride="true"
        />

        <login-view />

        <default-footer />

      </div>
    </v-img>
  </v-app>
</template>

<script>
  export default {
    name: 'DefaultLayout',
    components: {
      DefaultBar: () => import(
        /* webpackChunkName: "default-app-bar" */
        '../default/AppBar'
      ),
      DefaultDrawer: () => import(
        /* webpackChunkName: "default-drawer" */
        '../default/Drawer'
      ),
      DefaultFooter: () => import(
        /* webpackChunkName: "default-footer" */
        '../default/Footer'
      ),
      // TODO: Add optional image background to default layout
      LoginView: () => import(
        './View'
      )
    },
    computed: {
      theme () {
        return (this.$vuetify.theme.dark) ? 'dark' : 'light'
      }
    }
  }
</script>
