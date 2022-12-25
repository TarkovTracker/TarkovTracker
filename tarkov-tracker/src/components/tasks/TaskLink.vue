<template>
  <router-link to="/">
    <div class="d-flex">
      <v-avatar size="1.5em" style="vertical-align: middle;">
        <v-img :src="traderAvatar" />
      </v-avatar>
      <span class="ml-2 font-weight-bold">
        {{ task.name }}
      </span>
    </div>
  </router-link>
</template>
<script setup>
import { computed } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata';
// Define the props for the component
const props = defineProps({
  taskId: {
    type: String,
    required: true,
  }
})
const { tasksById } = useTarkovData()

const task = computed(() => tasksById.value[props.taskId] || {})

const traderAvatar = computed(() => {
  return `/img/traders/${task.value?.trader?.id}.jpg`
})

</script>
<style lang="scss" scoped>
a:any-link {
  color: rgba(var(--v-theme-tasklink), 1) !important;
  text-decoration: none;
}
</style>