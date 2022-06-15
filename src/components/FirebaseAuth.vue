<template>
  <div v-if="maintenance_mode == 'true'" class="text-center">
    <div>The TarkovTracker cloud service is in maintenance mode.</div>
    <div>Check the <v-icon dark>mdi-discord</v-icon> <a href="https://discord.gg/zeAP4Ng" class="info-link">TarkovTracker Discord server</a> for more information.</div>
  </div>
  <div v-else>
    <div id="firebaseui-auth-container" />
  </div>
</template>
<script>
  import * as firebaseui from 'firebaseui'
  import firebase from 'firebase/app'
  import fireapp from '@/fireapp.js'
  export default {
    name: 'FirebaseAuth',
    data () {
      return {
        maintenance_mode: false
      }
    },
    mounted () {
      const remoteConfig = fireapp.remoteConfig()

      this.maintenance_mode = remoteConfig.getValue('maintenance_mode')._value
      remoteConfig.fetchAndActivate()
      .then(() => {
        this.maintenance_mode = remoteConfig.getValue('maintenance_mode')._value
      })

      // FirebaseUI config.
      const uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true
          },
          uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
          }
        },
        signInSuccessUrl: '/',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID,
          firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          {
            provider: 'microsoft.com',
            loginHintKey: 'login_hint'
          }
        ],
        signInFlow: 'popup',
        // Terms of Service
        tosUrl: 'https://www.termsfeed.com/live/d3a09e33-cd8e-4e08-8533-9c7a270d9ac1',
        // Privacy policy url/callback.
        privacyPolicyUrl: 'https://www.termsfeed.com/live/b6d6f7fd-adc4-4717-8a2b-83daf9d8ddb9'
      }
      // Initialize the FirebaseUI Widget using Firebase.
      // The start method will wait until the DOM is loaded.
      if (this.maintenance_mode != 'true') {
        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(this.$firebase.auth())
        ui.start('#firebaseui-auth-container', uiConfig)
      }
    }
  }
</script>
<style lang="sass">
.firebaseui-tos
  text-decoration: none
  color: #ffffff

.firebaseui-link
  text-decoration: none
  color: #00acc1 !important
</style>
