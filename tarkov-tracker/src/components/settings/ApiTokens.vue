<template>
  <v-container>
    These are my tokens
    {{ systemStore.tokens.length }}
  </v-container>
  <v-container v-if="showNewTokenForm">
    <!-- Form to create a user API token -->
    <v-sheet color="secondary_dark" rounded class="pa-2">
      <v-form ref="newTokenForm" v-model="validNewToken">
        <v-text-field v-model="tokenName" :rules="tokenNameRules" label="Token Description" required density="compact">
        </v-text-field>
        <!-- For each available permission flag, display it as a checkbox -->
        <v-checkbox v-for="(permission, permissionKey) in availablePermissions" :key="permission"
          v-model="selectedPermissions" :label="permission.title" :value="permissionKey" density="compact" hide-details>
        </v-checkbox>
        <v-btn :disabled="!validNewToken || selectedPermissions.length == 0 || creatingToken" color="success"
          class="mr-4" @click="createToken" :loading="creatingToken" append-icon="mdi-key-plus">
          {{ $t('page.settings.card.apitokens.submit_new_token') }}
        </v-btn>
      </v-form>
    </v-sheet>
  </v-container>
  <v-container class="align-left" fluid>
    <v-row align="start">
      <v-btn v-if="!showTokens" @click="loadTokens" variant="outlined" prepend-icon="mdi-key-star" class="mx-1">
        {{ $t('page.settings.card.apitokens.show_tokens') }}
      </v-btn>
      <!-- Button to show the new token form -->
      <v-btn v-if="!showNewTokenForm" @click="showNewTokenForm = true" variant="outlined" class="mx-1"
        prepend-icon="mdi-unfold-more-horizontal">
        {{ $t('page.settings.card.apitokens.new_token_expand') }}
      </v-btn>
    </v-row>
  </v-container>
  <v-snackbar v-model="newTokenSnackbar" :timeout="4000" color="accent">
    {{ tokenResult }}

    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="newTokenSnackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
<script setup>
import { ref, computed } from "vue";
import { fireapp } from "@/plugins/firebase";
import { useSystemStore } from "@/stores/system.js";

// New token form
const newTokenForm = ref(null);
const validNewToken = ref(false);
const tokenName = ref("");
const selectedPermissions = ref([]);
const tokenNameRules = ref([
  (v) => !!v || "You must enter a token description",
  (v) => v.length <= 20 || "Token description must be less than 20 characters",
]);
const creatingToken = ref(false);
const tokenResult = ref(null);
const newTokenSnackbar = ref(false);
const showNewTokenForm = ref(false);
// Create a function which calls the createToken function with the current token name and selected permissions
const createToken = async () => {
  creatingToken.value = true;
  try {
    tokenResult.value = await fireapp.functions().httpsCallable("createToken")({ note: tokenName.value, permissions: selectedPermissions.value });
    newTokenForm.value.reset();
    selectedPermissions.value = [];
    tokenResult.value = "Token succesfully created";
    newTokenSnackbar.value = true;
  } catch (error) {
    tokenResult.value = "There was an error creating your token";
    newTokenSnackbar.value = true;
  }

  creatingToken.value = false;
};

// Tokens
const systemStore = useSystemStore();
const loadingTokens = ref(false);
const loadTokens = async () => {
  loadingTokens.value = true;
  try {
    //tokens.value = await fireapp.functions().httpsCallable("getTokens")();
  } catch (error) {
    tokenResult.value = "There was an error loading your tokens";
    newTokenSnackbar.value = true;
  }
  loadingTokens.value = false;
};

// Permissions
const availablePermissions = {
  GP: {
    title: 'Get Progression',
    description: 'Allows access to read your general progression information, including your TarkovTracker display name, quest progress, hideout progress'
  },
  TP: {
    title: 'Get Team Progression',
    description: 'Allows access to read a virtual copy of your team\'s progress, including display names, quest, and hideout progress'
  },
  WP: {
    title: 'Write Progression',
    description: 'Allows access to update your TarkovTracker progress data on your behalf'
  }
}
</script>
<style lang="scss" scoped>

</style>