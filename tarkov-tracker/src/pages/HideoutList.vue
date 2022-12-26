<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">

      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
import { defineAsyncComponent } from 'vue'

const { tasks, maps, traders } = useTarkovData()

</script>
<style lang="scss" scoped>

</style>