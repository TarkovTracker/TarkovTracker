<template>
  <v-fade-transition mode="out-in">
    <template v-if="maintenance_mode == 'true'">
      <div class='maintenance-mode'>
        <img src="https://tarkovtracker.io/img/tarkovtrackerlogo-light.png" class="maintenance-logo">
        <h1>TarkovTracker is in maintenace mode</h1>
        <p>We are working on upgrading a backend system which necessitates a short downtime.</p>
        <p>You can check the <a href="https://discord.gg/zeAP4Ng">TarkovTracker Discord server</a> for the latest updates</p>
      </div> 
    </template>
    <template v-else>
      <router-view />
    </template>
  </v-fade-transition>
</template>

<script>
  // Styles
  import '@/styles/overrides.sass'
  import fireapp from './fireapp.js'

  export default {
    name: 'TarkovTracker',
    data () {
      return {
        maintenance_mode: false,
      }
    },
    metaInfo: {
      title: 'Dashboard',
      titleTemplate: '%s | TarkovTracker',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
    mounted() {
      const remoteConfig = fireapp.remoteConfig();
      
      this.maintenance_mode = remoteConfig.getValue("maintenance_mode")._value;
      remoteConfig.fetchAndActivate()
      .then(() => {
        this.maintenance_mode = remoteConfig.getValue("maintenance_mode")._value;
        console.log(this.maintenance_mode)
      })
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
<style lang="sass">
.maintenance-mode
 color: #FFFFFF
 text-align: center
.maintenance-logo
  display:block
  margin-left:auto
  margin-right:auto
  margin-top:64px
  margin-bottom:16px
</style>
