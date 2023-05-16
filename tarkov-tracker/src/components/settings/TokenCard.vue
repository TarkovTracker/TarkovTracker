<template>
  <v-sheet class="pa-2" color="primary" :rounded="true">
    <div>
      <b>{{ $t("page.settings.card.apitokens.note_column") }}:</b>
      {{ tokenDataRef?.note }}
    </div>
    <div>
      <b>{{ $t("page.settings.card.apitokens.token_column") }}:</b>
      {{ tokenHidden }}
    </div>
    <div>
      <!-- Display the permission titles the token has -->
      <b>{{ $t("page.settings.card.apitokens.permissions_column") }}: </b>
      <span v-for="(permission, index) in tokenPermissions" :key="index">
        {{ $t("page.settings.card.apitokens.permission." + permission)
        }}<span v-if="index < tokenPermissions.length - 1">, </span>
      </span>
    </div>
    <div>
      {{ $t("page.settings.card.apitokens.created_column") }} {{ relativeDays }}
    </div>
    <div v-show="showQR">
      <!-- Create a canvas with an ID of the token -->
      <template v-if="userStore.getStreamerMode">
        {{ $t("page.settings.card.apitokens.streamer_mode_qr") }}
      </template>
      <template v-else>
        <canvas :id="props.token + '-tc'"></canvas>
      </template>
    </div>
    <div class="mt-1">
      <!-- Button to copy the token into clipboard -->
      <v-btn
        variant="outlined"
        icon="mdi-content-copy"
        class="mx-1"
        color="secondary"
        size="x-small"
        @click="copyToken"
      ></v-btn>
      <!-- Button to toggle a QR code for the token -->
      <v-btn
        variant="outlined"
        icon="mdi-qrcode"
        class="mx-1"
        color="secondary"
        size="x-small"
        @click="showQR = !showQR"
      ></v-btn>
      <!-- Button to delete the token -->
      <v-btn
        variant="outlined"
        icon="mdi-delete"
        class="mx-1"
        color="secondary"
        :disabled="deleting"
        :loading="deleting"
        size="x-small"
        @click="deleteToken"
      ></v-btn>
    </div>
  </v-sheet>
</template>
<script setup>
import { fireapp } from "@/plugins/firebase";
import { doc, getDoc } from "firebase/firestore";
import { defineProps, computed, onMounted } from "vue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import QRCode from "qrcode";
import availablePermissions from "@/utils/api_permissions.js";
import { useUserStore } from "@/stores/user";

// Get locale for use in calculating relative time
const { locale } = useI18n({ useScope: "global" });

// Define the props for the component
const props = defineProps({
  token: {
    type: String,
    required: true,
  },
});

const userStore = useUserStore();

// Ref to store tokenData when retrieved from Firestore
const tokenDataRef = ref(null);
const tokenDoc = doc(fireapp.firestore(), "token", props.token);
// Retrieve the data from the document then store it in tokenDataRef
getDoc(tokenDoc)
  .then((doc) => {
    if (doc.exists()) {
      tokenDataRef.value = doc.data();
    }
  })
  .catch((error) => {
    console.error("Error getting document:", error);
  });

// Computed property to retrieve the timestamp of the token creation
const tokenCreated = computed(() => {
  if (!tokenDataRef.value?.created) return Date.now();
  return tokenDataRef.value.created.toDate() || Date.now();
});

// Computed property to display the permissions of the token
const tokenPermissions = computed(() => {
  if (!tokenDataRef.value?.permissions) return [];
  return tokenDataRef.value.permissions;
});

// Calculate the relative days since the token was created using Intl.RelativeTimeFormat
const relativeDays = computed(() => {
  const relativeTimeFormat = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  });
  const days = Math.floor((Date.now() - tokenCreated.value) / 86400000);
  return relativeTimeFormat.format(days, "day");
});

// Get a string representation of the token where all but the last 4 characters are replaced with *
const tokenHidden = computed(() => {
  if (userStore.getStreamerMode) {
    return props.token.replace(/.(?=.{0})/g, "*");
  } else {
    return props.token.replace(/.(?=.{5})/g, "*");
  }
});

// Copy token to clipboard function
const copyToken = () => {
  navigator.clipboard.writeText(props.token);
};

// Ref to store whether the token is being deleted
const deleting = ref(false);

// Delete token function
const deleteToken = () => {
  // Use the firebase callable function to delete the token
  const deleteToken = fireapp.functions().httpsCallable("revokeToken");
  // Set deleting to true to disable the button
  deleting.value = true;
  // Call the function and then read the result
  deleteToken({ token: props.token }).then((result) => {
    // Read result of the Cloud Function.
    if (result.data.error) {
      // If there was an error, log it
      console.error(result.data.error);
    }
    // Set deleting to false to re-enable the button
    deleting.value = false;
  });
};

// Ref to store whether the QR code is being shown
const showQR = ref(false);

onMounted(() => {
  // Create the QR code for the token
  QRCode.toCanvas(
    document.getElementById(props.token + "-tc"),
    props.token,
    {},
    function (error) {
      if (error) console.error(error);
    }
  );
});
</script>
<style lang="scss" scoped></style>
