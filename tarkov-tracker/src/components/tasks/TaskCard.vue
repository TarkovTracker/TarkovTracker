<template>
  <v-sheet class="pa-2" :rounded="true">
    <v-container>
      <v-row>
        <v-col cols="12" xs="12" sm="4" md="3" lg="3" :align="xs ? 'center' : 'left'">
          <!-- Quest general info, links, and tags -->
          <template v-if="!xs">
            <!-- Not xs, so display full details -->
            <v-container class="ma-0 pa-0">
              <v-row no-gutters class="mb-2" style="font-size: 1.1em">
                <v-col cols="12">
                  <task-link :taskId="props.task.id" />
                </v-col>
              </v-row>
              <v-row no-gutters v-if="props.task.minPlayerLevel != 0">
                <v-col cols="auto" class="mr-1">
                  <v-icon icon="mdi-menu-right" />
                </v-col>
                <v-col>
                  <i18n-t keypath="page.tasks.questcard.level" scope="global">
                    <template #count>
                      {{ props.task.minPlayerLevel }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
              <v-row no-gutters class="mb-1" v-if="task?.predecessors?.length">
                <v-col cols="auto" class="mr-1">
                  <v-icon icon="mdi-lock-open-outline" />
                </v-col>
                <v-col>
                  <i18n-t keypath="page.tasks.questcard.lockedbefore" scope="global">
                    <template #count>
                      {{ lockedBefore }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
              <v-row no-gutters class="mb-1" v-if="task?.successors?.length">
                <v-col cols="auto" class="mr-1">
                  <v-icon icon="mdi-lock" />
                </v-col>
                <v-col>
                  <i18n-t keypath="page.tasks.questcard.lockedbehind" scope="global">
                    <template #count>
                      {{ lockedBehind }}
                    </template>
                  </i18n-t>
                </v-col>
              </v-row>
              <v-row no-gutters class="mb-1">
                <a :href="props.task.wikiLink" target="_blank" class="wiki-link">
                  <v-row no-gutters>
                    <v-col cols="auto" class="mr-1">
                      <v-icon icon="mdi-information-outline" />
                    </v-col>
                    <v-col>
                      {{ $t('page.tasks.questcard.wiki') }}
                    </v-col>
                  </v-row>
                </a>
              </v-row>
            </v-container>
          </template>
          <template v-else>
            <!-- xs, so display only the name -->
            <task-link :taskId="props.task.id" class="d-flex justify-center" />
          </template>
        </v-col>
        <v-col cols="12" xs="12" sm="8" md="7" lg="7">
          <!-- Quest objectives -->
        </v-col>
        <v-col cols="12" xs="12" sm="12" md="2" lg="2">
          <!-- Quest actions -->
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>
<script setup>
import { defineAsyncComponent, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useTarkovStore } from "@/stores/tarkov.js";
import { useTarkovData } from '@/composables/tarkovdata'
// Define the props for the component
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})
const tarkovStore = useTarkovStore()
const { tasksById } = useTarkovData()

const TaskLink = defineAsyncComponent(() =>
  import("@/components/tasks/TaskLink.vue")
)

const { xs } = useDisplay()

const lockedBehind = computed(() => {
  // Calculate how many of the successors are uncompleted (should be all, but someone might have marked off one)
  return props.task.successors.filter((s) => !tarkovStore.isTaskComplete(s.id)).length
})

const lockedBefore = computed(() => {
  // Calculate how many of the predecessors are uncompleted
  return props.task.predecessors.filter((s) => !tarkovStore.isTaskComplete(s.id)).length
})

</script>
<style lang="scss" scoped>
.wiki-link {
  text-decoration: none;
  color: rgba(var(--v-theme-tasklink), 1) !important;
}
</style>