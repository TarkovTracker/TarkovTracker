<template>
  <v-sheet>
    {{ JSON.stringify(token) }}
  </v-sheet>
</template>
<script setup>
import { fireapp } from "@/plugins/firebase";
import { doc, getDoc } from 'firebase/firestore'

const props = defineProps({
  token: {
    type: Object,
    required: true,
  }
})
</script>
<style lang="scss" scoped>

</style>