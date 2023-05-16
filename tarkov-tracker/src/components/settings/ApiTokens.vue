<template>
  <v-container>
    <template v-if="systemStore.userTokenCount == 0">{{
      $t("page.settings.card.apitokens.no_tokens")
    }}</template>
    <v-row no-gutters>
      <v-col
        v-for="(token, index) in systemStore.userTokens"
        :key="index"
        cols="12"
        sm="12"
        md="6"
        lg="6"
        xl="6"
      >
        <token-card :token="token" class="ma-2" />
      </v-col>
    </v-row>
  </v-container>
  <v-container v-if="showNewTokenForm">
    <!-- Form to create a user API token -->
    <v-sheet color="secondary_dark" rounded class="pa-2">
      <v-form ref="newTokenForm" v-model="validNewToken">
        <v-text-field
          v-model="tokenName"
          :rules="tokenNameRules"
          label="Token Description (Required)"
          required
          density="compact"
        >
        </v-text-field>
        <!-- For each available permission flag, display it as a checkbox -->
        <v-checkbox
          v-for="(permission, permissionKey) in availablePermissions"
          :key="permission"
          v-model="selectedPermissions"
          :label="permission.title"
          :value="permissionKey"
          :error="selectOneError"
          density="compact"
          hide-details
        >
        </v-checkbox>
        <v-btn
          :disabled="creatingToken"
          color="success"
          class="mr-4"
          :loading="creatingToken"
          append-icon="mdi-key-plus"
          @click="createToken"
        >
          {{ $t("page.settings.card.apitokens.submit_new_token") }}
        </v-btn>
      </v-form>
    </v-sheet>
  </v-container>
  <v-container class="align-left" fluid>
    <v-row align="start">
      <!-- Button to show the new token form -->
      <v-btn
        v-if="!showNewTokenForm"
        variant="outlined"
        class="mx-1"
        prepend-icon="mdi-unfold-more-horizontal"
        @click="showNewTokenForm = true"
      >
        {{ $t("page.settings.card.apitokens.new_token_expand") }}
      </v-btn>
    </v-row>
  </v-container>
  <v-snackbar v-model="newTokenSnackbar" :timeout="4000" color="accent">
    {{ tokenResult }}

    <template #actions>
      <v-btn color="white" variant="text" @click="newTokenSnackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
<script setup>
import { ref, defineAsyncComponent, computed } from "vue";
import { useI18n } from "vue-i18n";
import { fireapp } from "@/plugins/firebase";
import { useLiveData } from "@/composables/livedata";
import availablePermissions from "@/utils/api_permissions.js";
const TokenCard = defineAsyncComponent(() =>
  import("@/components/settings/TokenCard.vue")
);
const { t } = useI18n({ useScope: "global" });

const { useSystemStore } = useLiveData();
const systemStore = useSystemStore();

// New token form
const selectOneError = ref(false);
const newTokenForm = ref(null);
const validNewToken = ref(false);
const tokenName = ref("");
const selectedPermissions = ref([]);
const selectedPermissionsCount = computed(
  () => selectedPermissions.value.length
);
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
  // The error rules for vuetify3 checkboxes weren't working properly when this was implemented, so this is fairly ugly.
  let { valid } = await newTokenForm.value.validate();
  if (!valid) {
    if (selectedPermissionsCount.value == 0) {
      selectOneError.value = true;
      return;
    } else {
      selectOneError.value = false;
    }
    return;
  }

  if (selectedPermissionsCount.value == 0) {
    selectOneError.value = true;
    return;
  } else {
    selectOneError.value = false;
  }

  creatingToken.value = true;
  try {
    tokenResult.value = await fireapp.functions().httpsCallable("createToken")({
      note: tokenName.value,
      permissions: selectedPermissions.value,
    });
    newTokenForm.value.reset();
    selectedPermissions.value = [];
    tokenResult.value = t("page.settings.card.apitokens.create_token_success");
    newTokenSnackbar.value = true;
  } catch (error) {
    tokenResult.value = t("page.settings.card.apitokens.create_token_error");
    newTokenSnackbar.value = true;
  }

  creatingToken.value = false;
};

// Tokens
//const systemStore = useSystemStore();
</script>
<style lang="scss" scoped></style>
