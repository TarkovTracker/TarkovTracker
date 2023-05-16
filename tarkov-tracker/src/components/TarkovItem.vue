<template>
  <v-container
    fluid
    class="pa-0 float-container"
    @mouseenter="linkHover = true"
    @mouseleave="linkHover = false"
  >
    <v-row
      no-gutters
      class="align-center justify-center"
      :class="linkHover ? 'blur-item' : ''"
    >
      <v-col cols="auto" class="d-flex align-center justify-center">
        <img width="32" :src="itemIconUrl" class="mr-2 rounded" />
      </v-col>
      <v-col v-if="props.count" cols="auto" class="mr-2">{{
        props.count.toLocaleString()
      }}</v-col>
      <v-col cols="auto" class="align-center justify-center tarkov-item-name">
        <b>{{ props.itemName }}</b>
      </v-col>
    </v-row>
    <v-row
      v-show="linkHover"
      no-gutters
      class="float-link align-center justify-center"
    >
      <v-col cols="auto" class="mx-1">
        <v-avatar
          color="primary"
          title="Show item on EFT Wiki"
          size="1.5em"
          class="external-link"
          @click="openWikiLink()"
        >
          <v-img src="/img/wikilogo.png"></v-img>
        </v-avatar>
      </v-col>
      <v-col cols="auto" class="mx-1">
        <v-avatar
          color="primary"
          title="Show item on Tarkov.dev"
          size="1.5em"
          class="external-link"
          @click="openTarkovDevLink()"
        >
          <v-img src="/img/tarkovdevlogo.png"></v-img>
        </v-avatar>
      </v-col>
      <v-col cols="auto" class="mx-1">
        <v-avatar
          color="primary"
          title="Copy Item Name"
          size="1.5em"
          class="external-link"
          @click="copyItemName()"
        >
          <v-icon size="x-small">mdi-content-copy</v-icon>
        </v-avatar>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { computed, ref } from "vue";
// Define the props for the component
const props = defineProps({
  itemId: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: false,
    default: null,
  },
  devLink: {
    type: String,
    required: false,
    default: null,
  },
  wikiLink: {
    type: String,
    required: false,
    default: null,
  },
  count: {
    type: Number,
    required: false,
    default: null,
  },
});

const linkHover = ref(false);

const itemIconUrl = computed(() => {
  return `https://assets.tarkov.dev/${props.itemId}-icon.jpg`;
});

const openTarkovDevLink = () => {
  window.open(props.devLink, "_blank");
};

const openWikiLink = () => {
  window.open(props.wikiLink, "_blank");
};
</script>
<style lang="scss" scoped>
.tarkov-item-name {
  //color: rgba(var(--v-theme-tasklink), 1) !important;
}

.blur-item {
  filter: blur(1px);
}

.external-link {
  cursor: pointer;
}

.float-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.float-link {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
