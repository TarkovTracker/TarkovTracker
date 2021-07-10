<template>
  <v-app 
    :style="{background: $vuetify.theme.themes[theme].background}" 
    :class="appClass"
  >
    <default-bar />

    <default-drawer />

    <default-view />

    <default-footer />
  </v-app>
</template>

<script>
  export default {
    name: 'DefaultLayout',
    components: {
      DefaultBar: () => import(
        /* webpackChunkName: "default-app-bar" */
        './AppBar'
      ),
      DefaultDrawer: () => import(
        /* webpackChunkName: "default-drawer" */
        './Drawer'
      ),
      DefaultFooter: () => import(
        /* webpackChunkName: "default-footer" */
        './Footer'
      ),
      DefaultView: () => import(
        /* webpackChunkName: "default-view" */
        './View'
      ),
    },
    computed: {
      selectedFont: {
        get () {
          return this.$store.copy('app/font') || 0
        },
        set (value) {
          this.$store.set('app/font', value)
        }
      },
      theme () {
        return (this.$vuetify.theme.dark) ? 'dark' : 'light'
      },
      appClass () {
        return {
          'font-share-tech-mono': this.selectedFont == 0,
          'font-roboto': this.selectedFont == 1
        }
      }
    },
  }
</script>
<style lang="sass">
.font-share-tech-mono
  font-family: Share Tech Mono, sans-serif !important

.font-roboto
  font-family: Roboto, sans-serif !important
</style>