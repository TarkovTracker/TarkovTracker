<template>
  <v-fade-transition mode="out-in">
    <router-view />
  </v-fade-transition>
</template>

<script>
  // Styles
  import '@/styles/overrides.sass'

  export default {
    name: 'TarkovTracker',
    metaInfo: {
      title: 'Dashboard',
      titleTemplate: '%s | TarkovTracker',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
    changed (metaInfo) {
      this.$analytics.setCurrentScreen(metaInfo.title)
      this.$analytics.logEvent('page_view')
      this.$analytics.logEvent('screen_view', {
        app_name: 'web',
        screen_name: metaInfo.title,
      })
    },
  }
</script>
