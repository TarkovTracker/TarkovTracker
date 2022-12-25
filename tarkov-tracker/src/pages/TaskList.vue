<template>
  <tracker-tip tip="tasks"></tracker-tip>
  <v-container>
    <v-row dense>
      <v-col lg="4" md="12">
        <!-- Primary views (all, maps, traders) -->
        <v-card>
          <v-tabs v-model="activePrimaryView" bg-color="accent" slider-color="secondary" align-tabs="center"
            show-arrows>
            <v-tab v-for="view, index in primaryViews" :key="index" :value="view.view" :prepend-icon="view.icon">
              {{ view.title }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
      <v-col v-show="activePrimaryView == 'all'" lg="8" md="12">
        <!-- The user has selected all quests, no need to filter by a sub-category -->
        <v-card>
          <v-tabs bg-color="accent" slider-color="secondary" align-tabs="center">
            <v-tab value="all">
              {{ $t('page.tasks.showing_all_sources') }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
      <v-col v-show="activePrimaryView == 'maps'" lg="8" md="12">
        <!-- The user has selected quests by map -->
        <v-card>
          <v-tabs v-model="activeMapView" bg-color="accent" slider-color="secondary" align-tabs="center" show-arrows>
            <v-tab v-for="map, index in maps" :key="index" :value="map.id" prepend-icon="mdi-compass">
              {{ map.name }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
      <v-col v-show="activePrimaryView == 'traders'" lg="8" md="12">
        <!-- The user has selected quests by trader -->
        <v-card>
          <v-tabs v-model="activeTraderView" bg-color="accent" slider-color="secondary" align-tabs="center" show-arrows>
            <v-tab v-for="trader, index in traders" :key="index" :value="trader.id">
              <v-avatar color="primary" size="2em" class="mr-2">
                <v-img :src="traderAvatar(trader.id)" />
              </v-avatar>
              {{ trader.name }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col lg="4" md="12">
        <!-- Secondary views (available, locked, completed) -->
        <v-card>
          <v-tabs v-model="activeSecondaryView" bg-color="accent" slider-color="secondary" align-tabs="center"
            show-arrows>
            <v-tab v-for="view, index in secondaryViews" :key="index" :value="view.view" :prepend-icon="view.icon">
              {{ view.title }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
      <v-col lg="8" md="12">
        <!-- User view -->
        <v-card>
          <v-tabs v-model="activeUserView" bg-color="accent" slider-color="secondary" align-tabs="center">
            <v-tab v-for="view in userViews" :key="view.view" :value="view.view"
              :disabled="view.view == 'all' && activeSecondaryView != 'available'">
              {{ view.title }}
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col v-if="loadingTasks || reloadingTasks" cols="12" align="center">
        <!-- If we're still waiting on tasks from tarkov.dev API -->
        <v-progress-circular indeterminate color="secondary" class="mx-2"></v-progress-circular> {{
            $t('page.tasks.loading')
        }}
      </v-col>
    </v-row>
    <v-row v-show="!loadingTasks && !reloadingTasks" justify="center">
      <v-col cols="12" class="my-1">
        <v-lazy v-for="task, taskIndex in visibleTasks" :key="taskIndex" :options="{
          threshold: 0.5
        }" min-height="150">
          <task-card :task="task" class="my-1" />
        </v-lazy>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { defineAsyncComponent, computed, watch, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useTarkovData } from '@/composables/tarkovdata'
import { useProgressStore } from '@/stores/progress'
import { useTarkovStore } from '@/stores/tarkov'
const TrackerTip = defineAsyncComponent(() =>
  import("@/components/TrackerTip.vue")
)
const TaskCard = defineAsyncComponent(() =>
  import("@/components/tasks/TaskCard.vue")
)

const { t } = useI18n({ useScope: 'global' })
const userStore = useUserStore()
const progressStore = useProgressStore()
const tarkovStore = useTarkovStore()

const primaryViews = [
  { title: t('page.tasks.primaryviews.all'), icon: 'mdi-clipboard-check', view: 'all' },
  { title: t('page.tasks.primaryviews.maps'), icon: 'mdi-compass', view: 'maps' },
  { title: t('page.tasks.primaryviews.traders'), icon: 'mdi-account', view: 'traders' }
]

const secondaryViews = [
  { title: t('page.tasks.secondaryviews.available'), icon: 'mdi-clipboard-text', view: 'available' },
  { title: t('page.tasks.secondaryviews.locked'), icon: 'mdi-lock', view: 'locked' },
  { title: t('page.tasks.secondaryviews.completed'), icon: 'mdi-clipboard-check', view: 'completed' }
]

const activePrimaryView = computed({
  get: () => userStore.getTaskPrimaryView,
  set: (value) => userStore.setTaskPrimaryView(value)
})

const activeMapView = computed({
  get: () => userStore.getTaskMapView,
  set: (value) => userStore.setTaskMapView(value)
})

const activeTraderView = computed({
  get: () => userStore.getTaskTraderView,
  set: (value) => userStore.setTaskTraderView(value)
})

const activeSecondaryView = computed({
  get: () => userStore.getTaskSecondaryView,
  set: (value) => {
    if (value != 'available') {
      // If we're viewing locked or completed tasks, we need to make sure we're viewing an individual user
      if (activeUserView.value == 'all') {
        activeUserView.value = 'self'
      }
    }
    userStore.setTaskSecondaryView(value)
  }
})

const activeUserView = computed({
  get: () => userStore.getTaskUserView,
  set: (value) => userStore.setTaskUserView(value)
})

const { tasks, maps, traders, loading: tasksLoading, disabledTasks } = useTarkovData()

const userViews = computed(() => {
  let views = []
  views.push({ title: t('page.tasks.userviews.all'), view: 'all' })
  if (tarkovStore.getDisplayName == null) {
    // We don't have a display name set, so use the default language name for yourself
    views.push({ title: t('page.tasks.userviews.yourself'), view: 'self' })
  } else {
    // We have a display name set, so use that
    views.push({ title: tarkovStore.getDisplayName, view: 'self' })
  }
  // For each progressStore visible team member (other than yourself), add a view
  for (const teamId of Object.keys(progressStore.visibleTeamStores)) {
    if (teamId != 'self') {
      views.push({ title: progressStore.teammemberNames[teamId], view: teamId })
    }
  }

  return views
})

const traderAvatar = (id) => {
  return `/img/traders/${id}.jpg`
}

const loadingTasks = computed(() => {
  return tasksLoading.value
})

const reloadingTasks = ref(false)

const visibleTasks = shallowRef([])

const updateVisibleTasks = async function () {
  console.log('Updating visible tasks', Date.now())
  let visibleTaskList = JSON.parse(JSON.stringify(tasks.value))
  // First, filter tasks by the primary view
  if (activePrimaryView.value == 'maps') {
    // If the map view is set to to factory, filter by either night factory or factory id, otherwise match by map id
    if (activeMapView.value == '55f2d3fd4bdc2d5f408b4567') {
      visibleTaskList = visibleTaskList.filter((task) => task.locations.includes('55f2d3fd4bdc2d5f408b4567') || task.locations.includes('59fc81d786f774390775787e'))
    } else {
      visibleTaskList = visibleTaskList.filter((task) => task.locations.includes(activeMapView.value))
    }
  } else if (activePrimaryView.value == 'traders') {
    visibleTaskList = visibleTaskList.filter((task) => task.trader.id == activeTraderView.value)
  }

  if (activeUserView.value == 'all') {
    // We want to show tasks by their availablity to any team member
    if (activeSecondaryView.value == 'available') {
      visibleTaskList = visibleTaskList.filter((task) => Object.values(progressStore.unlockedTasks?.[task.id]).some(v => v === true))
    } else {
      // In theory, we should never be in this situation (we don't show locked or completed tasks for all users)
      // But just in case, we'll do nothing here
    }
  } else {
    // We want to show tasks by their availablity to a specific team member
    if (activeSecondaryView.value == 'available') {
      visibleTaskList = visibleTaskList.filter((task) => progressStore.unlockedTasks?.[task.id]?.[activeUserView.value] === true)
    } else if (activeSecondaryView.value == 'locked') {
      visibleTaskList = visibleTaskList.filter((task) => progressStore.taskCompletions?.[task.id]?.[activeUserView.value] != true && progressStore.unlockedTasks?.[task.id]?.[activeUserView.value] != true)
    } else if (activeSecondaryView.value == 'completed') {
      visibleTaskList = visibleTaskList.filter((task) => progressStore.taskCompletions?.[task.id]?.[activeUserView.value] === true)
    }
  }
  // Remove any disabled tasks from the view
  visibleTaskList = visibleTaskList.filter((task) => disabledTasks.includes(task.id) == false)

  // Finally, map the tasks to their IDs
  //visibleTaskList = visibleTaskList.map((task) => task.id)

  reloadingTasks.value = false
  visibleTasks.value = visibleTaskList
  console.log('Updated visible tasks', Date.now())
}

// Watch for changes to all of the views, and update the visible tasks
watch([activePrimaryView, activeMapView, activeTraderView, activeSecondaryView, activeUserView, tasks], async () => {
  reloadingTasks.value = true
  console.log("Calling updateVisibleTasks", Date.now())
  await updateVisibleTasks()
  console.log("Finished calling updateVisibleTasks", Date.now())
}, { immediate: true })
</script>
<style lang="scss" scoped>

</style>