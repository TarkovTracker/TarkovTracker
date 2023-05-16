<template>
  <tracker-tip tip="login"></tracker-tip>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div v-if="fireuser?.uid" class="text-center">
          You are already signed in!
        </div>
        <div
          v-show="fireuser?.uid == null"
          id="firebaseui-auth-container"
        ></div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { onMounted, defineAsyncComponent } from "vue";
import * as firebaseui from "firebaseui";
import { firebase, fireapp, fireuser } from "@/plugins/firebase";
import { useRouter } from "vue-router";
import { FirebaseError } from "@firebase/util";
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
);
const router = useRouter();
const ui =
  firebaseui.auth.AuthUI.getInstance() ||
  new firebaseui.auth.AuthUI(fireapp.auth());

onMounted(() => {
  // Initialize the FirebaseUI Widget using Firebase.
  // The start method will wait until the DOM is loaded.
  ui.start("#firebaseui-auth-container", uiConfig);
});
// FirebaseUI config.
const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function () {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      router.push("/");
      return false;
    },
    uiShown: function () {
      // The widget is rendered.
      // Hide the loader.
    },
  },
  signInSuccessUrl: "/",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    {
      provider: "microsoft.com",
      loginHintKey: "login_hint",
    },
  ],
  signInFlow: "popup",
  // Terms of Service
  tosUrl: "https://www.termsfeed.com/live/d3a09e33-cd8e-4e08-8533-9c7a270d9ac1",
  // Privacy policy url/callback.
  privacyPolicyUrl:
    "https://www.termsfeed.com/live/b6d6f7fd-adc4-4717-8a2b-83daf9d8ddb9",
};
</script>
<style lang="scss" scoped>
@import "https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css";

:deep(.firebaseui-tos) {
  text-decoration: none;
  color: #ffffff;
}

:deep(.firebaseui-link) {
  text-decoration: none;
  color: rgba(var(--v-theme-link), 1) !important;
}
</style>
