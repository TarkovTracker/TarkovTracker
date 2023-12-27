<template>
  <v-container v-if="userStore.showTip(props.tip)" class="mb-0 pb-0">
    <v-row justify="center">
      <v-col cols="12">
        <v-alert :color="props.color" theme="dark" :icon="props.icon" border prominent>
          {{ $t("tips." + props.tip + ".description") }}
          <v-container class="align-right pa-0 pt-2" fluid>
            <v-btn variant="tonal" prepend-icon="mdi-eye-off" style="opacity: 0.75" @click="hideTip">
              {{ $t("tips.hide_tip") }}
            </v-btn>
          </v-container>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { defineProps, computed } from "vue";
import { useUserStore } from "@/stores/user.js";

const props = defineProps({
  icon: {
    type: String,
    default: "mdi-comment-question",
    required: false,
  },
  iconColor: {
    type: String,
    default: "white",
    required: false,
  },
  color: {
    type: String,
    default: "accent",
    required: false,
  },
  tip: {
    type: String,
    default: "default",
    required: true,
  },
});

const userStore = useUserStore();

const hideTip = () => {
  userStore.hideTip(props.tip);
};
</script>
<style lang="scss" scoped></style>
