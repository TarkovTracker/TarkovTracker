<template>
  <v-alert color="orange" theme="dark" border prominent class="mx-4 mt-2">
    This page wasn't quite finished before the wipe went live. I still have a bunch of polishing left to do, and
    building a
    list view
    alternative. If you would like to, feel free to leave feedback in the Discord.
  </v-alert>
  <tracker-tip tip="neededitems"></tracker-tip>
  <v-container>
    <v-row v-if="loading || hideoutLoading" justify="center">
      <v-col cols="12" align="center">
        <v-progress-circular indeterminate color="secondary" class="mx-2"></v-progress-circular> {{
    $t('page.neededitems.loading')
}} <refresh-button />
      </v-col>
    </v-row>
    <v-row justify="center" align="center" dense>
      <v-col cols="12" sm="12" md="3" lg="3">
        <!-- Primary views (all, maps, traders) -->
        <v-card>
          <v-tabs v-model="activeNeededView" bg-color="accent" slider-color="secondary" align-tabs="center" show-arrows>
            <v-tab v-for="view, index in neededViews" :key="index" :value="view.view" :prepend-icon="view.icon">
              {{ view.title }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
      <v-col cols="12" sm="11" md="8" lg="8">
        <v-text-field v-model="itemFilterNameText" label="Search by item name" variant="solo"
          hide-details></v-text-field>
      </v-col>
      <v-col cols="1">
        <v-dialog v-model="settingsDialog">
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="tonal" style="width:100%;height:48px">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </template>
          <v-row class="justify-center">
            <v-col cols="auto">
              <v-card :title="$t('page.neededitems.options.title')" style="width: fit-content;">
                <v-card-text>
                  <v-container class="ma-0 pa-0">
                    <v-row dense>
                      <v-col cols="12">
                        <v-switch v-model="hideFIR" :label="$t(hideFIRLabel)" inset true-icon="mdi-eye-off"
                          false-icon="mdi-eye" :color="hideFIRColor" hide-details density="compact"></v-switch>
                      </v-col>
                    </v-row>
                    <v-row justify="end">
                      <v-col cols="12" md="6">
                        <v-btn color="primary" block @click="settingsDialog = false">{{
    $t('page.neededitems.options.close')
}}</v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-dialog>
      </v-col>
    </v-row>
    <v-row v-show="activeNeededView == 'all' || activeNeededView == 'tasks'">
      <needed-item-card v-for="neededItem, itemIndex in neededTaskItems" :key="itemIndex" :need="neededItem"
        class="my-1" />
    </v-row>
    <v-row v-show="activeNeededView == 'all' || activeNeededView == 'hideout'">
      <needed-item-card v-for="neededItem, itemIndex in neededHideoutItems" :key="itemIndex" :need="neededItem"
        class="my-1" />
    </v-row>
  </v-container>
</template>
<script setup>
import { computed, provide, ref, watch } from 'vue'
import { useTarkovData } from '@/composables/tarkovdata'
import { useProgressStore } from '@/stores/progress'
import { defineAsyncComponent } from 'vue'
import { debounce } from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
)
const RefreshButton = defineAsyncComponent(() =>
  import("@/components/RefreshButton.vue")
)
const NeededItemCard = defineAsyncComponent(() =>
  import("@/components/neededitems/NeededItemCard.vue")
)
const { t } = useI18n({ useScope: 'global' })
const { tasks, maps, traders, hideoutModules, hideoutLoading, loading, neededItemTaskObjectives, neededItemHideoutModules } = useTarkovData()
const progressStore = useProgressStore()
const userStore = useUserStore()

const itemFilterNameText = ref('')
const itemFilterName = ref('')
provide('itemFilterName', itemFilterName)

watch(itemFilterNameText, debounce((newVal) => {
  itemFilterName.value = newVal
}, 500))

const settingsDialog = ref(false)

const neededViews = [
  { title: t('page.neededitems.neededviews.all'), icon: 'mdi-all-inclusive', view: 'all' },
  { title: t('page.neededitems.neededviews.tasks'), icon: 'mdi-clipboard-text', view: 'tasks' },
  { title: t('page.neededitems.neededviews.hideout'), icon: 'mdi-home', view: 'hideout' }
]

const activeNeededView = computed({
  get: () => userStore.getNeededTypeView,
  set: (value) => userStore.setNeededTypeView(value)
})

const neededTaskItems = computed(() => {
  return JSON.parse(JSON.stringify(neededItemTaskObjectives.value)).sort((a, b) => {
    let aCount = 0
    tasks.value.find((task) => task.id == a.taskId).predecessors.forEach((predecessor) => {
      // Check if the predecessor is completed
      if (progressStore.tasksCompletions?.[predecessor]?.['self'] === false) {
        aCount++
      }
    })

    let bCount = 0
    tasks.value.find((task) => task.id == b.taskId).predecessors.forEach((predecessor) => {
      // Check if the predecessor is completed
      if (progressStore.tasksCompletions?.[predecessor]?.['self'] === false) {
        bCount++
      }
    })
    if (aCount > bCount) {
      return 1
    } else if (aCount < bCount) {
      return -1
    }
    return 0
  })
})

const neededHideoutItems = computed(() => {
  let hideoutNeeds = JSON.parse(JSON.stringify(neededItemHideoutModules.value)).sort((a, b) => {
    let aCount = 0
    hideoutModules.value.find((hModule) => hModule.id == a.hideoutModule.id).predecessors.forEach((predecessor) => {
      // Check if the predecessor is completed
      if (progressStore.moduleCompletions?.[predecessor]?.['self'] === false) {
        aCount++
      }
    })

    let bCount = 0
    hideoutModules.value.find((hModule) => hModule.id == b.hideoutModule.id).predecessors.forEach((predecessor) => {
      // Check if the predecessor is completed
      if (progressStore.moduleCompletions?.[predecessor]?.['self'] === false) {
        bCount++
      }
    })
    if (aCount > bCount) {
      return 1
    } else if (aCount < bCount) {
      return -1
    }
    return 0
  })
  return hideoutNeeds
})

const hideFIR = computed({
  get: () => userStore.itemsNeededHideNonFIR,
  set: (value) => userStore.setItemsNeededHideNonFIR(value)
})
const hideFIRLabel = computed(() => userStore.itemsNeededHideNonFIR ? 'page.neededitems.options.items_hide_non_fir' : 'page.neededitems.options.items_show_non_fir')
const hideFIRColor = computed(() => userStore.itemsNeededHideNonFIR ? 'error' : 'success')


</script>
<style lang="scss" scoped>

</style>