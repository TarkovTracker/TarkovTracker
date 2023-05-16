<template>
  <v-sheet
    rounded
    class="elevation-2 corner-highlight-parent"
    :class="{ 'fill-height': props.fillHeight }"
    color="rgba(33,33,33,1)"
  >
    <v-container class="fill-height ma-0 pa-0">
      <v-row no-gutters class="fill-height">
        <v-col cols="12" class="text-h5 mt-2">
          <span :class="highlightClasses">
            <v-icon :color="props.iconColor">{{ props.icon }}</v-icon>
          </span>
          <span class="text-left pa-2 pb-0">
            <slot name="title"></slot>
          </span>
        </v-col>
        <v-col cols="12" class="mt-2 text-center">
          <slot name="content"></slot>
        </v-col>
        <v-col align-self="end" cols="12" class="pb-1">
          <slot name="footer"></slot>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
  icon: {
    type: String,
    default: "mdi-check-all",
    required: false,
  },
  iconColor: {
    type: String,
    default: "white",
    required: false,
  },
  highlightColor: {
    type: String,
    default: "accent",
    required: false,
  },
  fillHeight: {
    type: Boolean,
    default: true,
    required: false,
  },
});

const highlightClasses = computed(() => {
  let classes = {};
  classes[`highlight-${props.highlightColor}`] = true;
  classes[`corner-highlight`] = true;
  classes[`elevation-3`] = true;
  return classes;
});
</script>
<style lang="scss" scoped>
.corner-highlight {
  border-right-style: solid;
  border-right-width: 0px;
  border-bottom-style: solid;
  border-bottom-width: 0px;
  margin: 0px;
  padding: 12px;
  background-clip: padding-box;
  border-radius: 0px 0px 10px 0px;
}

.highlight-green {
  background: linear-gradient(
    90deg,
    rgba(1, 36, 0, 0.15) 0%,
    rgba(15, 121, 9, 0.15) 35%,
    rgba(0, 83, 0, 0.15) 100%
  );
}

.highlight-blue {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 36, 0.15) 0%,
    rgba(0, 0, 121, 0.15) 35%,
    rgba(0, 0, 83, 0.15) 100%
  );
}

.highlight-red {
  background: linear-gradient(
    90deg,
    rgba(36, 0, 0, 0.15) 0%,
    rgba(121, 0, 0, 0.15) 35%,
    rgba(83, 0, 0, 0.15) 100%
  );
}

.highlight-tan {
  background: linear-gradient(
    90deg,
    rgba(36, 36, 0, 0.15) 0%,
    rgba(121, 121, 0, 0.15) 35%,
    rgba(83, 83, 0, 0.15) 100%
  );
}

.highlight-purple {
  background: linear-gradient(
    90deg,
    rgba(36, 0, 36, 0.15) 0%,
    rgba(121, 0, 121, 0.15) 35%,
    rgba(83, 0, 83, 0.15) 100%
  );
}

.highlight-accent {
  background: linear-gradient(
    135deg,
    rgba(29, 36, 38, 1) 0%,
    rgba(32, 46, 54, 1) 35%,
    rgba(35, 49, 56, 1) 100%
  );
}

.highlight-secondary {
  background: linear-gradient(
    135deg,
    rgba(125, 111, 85, 1) 0%,
    rgba(172, 157, 128, 1) 35%,
    rgba(154, 136, 102, 1) 100%
  );
}

.corner-highlight-parent {
  overflow: hidden;
}
</style>
