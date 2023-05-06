<template>
  <v-col v-if="showItemFilter" cols="12" sm="6" md="4" lg="3" xl="2">
    <KeepAlive>
      <v-lazy
:options="{
  threshold: 0.5
}" min-height="100" class="fill-height">
        <v-sheet rounded class="fill-height">
          <v-container class="pa-0 fill-height">
            <v-row no-gutters>
              <v-col cols="12" class="item-panel pa-0 pb-2">
                <v-img :src="item.image512pxLink" :lazy-src="item.baseImageLink" :class="itemImageClasses">
                  <template #placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-col>
            </v-row>
            <v-row no-gutters class="pb-2" justify="end">
              <v-col cols="12" class="text-center px-2">
                {{ item.name }}
              </v-col>
              <v-col cols="12">
                <template v-if="props.need.needType == 'taskObjective'">
                  <task-link :task="relatedTask" class="d-flex justify-center" />
                  <v-row v-if="relatedTask.predecessors?.length > 0" no-gutters class="mb-1 mt-1 d-flex justify-center">
                    <v-col cols="auto" class="mr-1" align="center">
                      <v-icon icon="mdi-lock-open-outline" />
                    </v-col>
                    <v-col cols="auto" align="center">
                      <i18n-t keypath="page.tasks.questcard.lockedbefore" scope="global">
                        <template #count>
                          {{ lockedBefore }}
                        </template>
                      </i18n-t>
                    </v-col>
                  </v-row>
                  <v-row v-if="levelRequired > 0" no-gutters class="mb-1 mt-1 d-flex justify-center">
                    <v-col cols="auto" class="mr-1" align="center">
                      <v-icon icon="mdi-menu-right" />
                    </v-col>
                    <v-col cols="auto" align="center">
                      <i18n-t keypath="page.tasks.questcard.level" scope="global">
                        <template #count>
                          {{ levelRequired }}
                        </template>
                      </i18n-t>
                    </v-col>
                  </v-row>
                </template>
                <template v-else-if="props.need.needType == 'hideoutModule'">
                  <v-row dense no-gutters class="mb-1 mt-1 d-flex justify-center">
                    <v-col cols="auto" align="center">
                      <station-link :station="relatedStation" class="justify-center" />
                    </v-col>
                    <v-col cols="auto" class="ml-1">{{ props.need.hideoutModule.level }}</v-col>
                  </v-row>
                  <v-row v-if="props.need.hideoutModule.predecessors?.length > 0" no-gutters
                    class="mb-1 mt-1 d-flex justify-center">
                    <v-col cols="auto" class="mr-1" align="center">
                      <v-icon icon="mdi-lock-open-outline" />
                    </v-col>
                    <v-col cols="auto" align="center">
                      <i18n-t keypath="page.tasks.questcard.lockedbefore" scope="global">
                        <template #count>
                          {{ lockedBefore }}
                        </template>
                      </i18n-t>
                    </v-col>
                  </v-row>
                  <v-row v-if="levelRequired > 0" no-gutters class="mb-1 mt-1 d-flex justify-center">
                    <v-col cols="auto" class="mr-1" align="center">
                      <v-icon icon="mdi-menu-right" />
                    </v-col>
                    <v-col cols="auto" align="center">
                      <i18n-t keypath="page.tasks.questcard.level" scope="global">
                        <template #count>
                          {{ levelRequired }}
                        </template>
                      </i18n-t>
                    </v-col>
                  </v-row>
                </template>
                <v-row v-if="selfValid && !selfCompletedNeed" class="text-center mx-2 mt-2" no-gutters>
                  <v-col cols="3">
                    <v-btn
variant="tonal" class="pa-0 ma-0"
                      @click="decreaseCount()"><v-icon>mdi-minus-thick</v-icon></v-btn>
                  </v-col>
                  <v-col cols="5">
                    <v-btn variant="tonal" class="pa-0 ma-0" @click="toggleCount()">{{ currentCount }}/{{ neededCount
}}</v-btn>
                  </v-col>
                  <v-col cols="3">
                    <v-btn
variant="tonal" class="pa-0 ma-0"
                      @click="increaseCount()"><v-icon>mdi-plus-thick</v-icon></v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-sheet>
      </v-lazy>
    </KeepAlive>
  </v-col>
</template>
<script setup>
import { defineAsyncComponent, computed, inject } from "vue";
import { useUserStore } from "@/stores/user";
import { useProgressStore } from "@/stores/progress";
import { useTarkovData } from "@/composables/tarkovdata";
import { useTarkovStore } from "@/stores/tarkov";
const DrawerItem = defineAsyncComponent(() =>
  import("@/components/drawer/DrawerItem.vue")
);
const TaskLink = defineAsyncComponent(() =>
  import("@/components/tasks/TaskLink.vue")
)
const StationLink = defineAsyncComponent(() =>
  import("@/components/hideout/StationLink.vue")
)
const props = defineProps({
  need: {
    type: Object,
    required: true,
  },
})
const userStore = useUserStore()
const progressStore = useProgressStore()
const tarkovStore = useTarkovStore()

const { tasks, hideoutModules, hideoutStations } = useTarkovData()

const filterString = inject('itemFilterName')

const showItemFilter = computed(() => {
  if (filterString.value == '') {
    return showItem.value
  } else {
    return (item.value.shortName.toLowerCase().includes(filterString.value.toLowerCase()) || item.value.name.toLowerCase().includes(filterString.value.toLowerCase())) && showItem.value
  }
})

const showItem = computed(() => {
  if (props.need.needType == 'taskObjective') {
    return isTaskObjectiveNeeded(props.need)
  } else if (props.need.needType == 'hideoutModule') {
    return isHideoutModuleNeeded(props.need)
  } else {
    return false
  }
})

function isTaskObjectiveNeeded(need) {
  if (userStore.itemsNeededHideNonFIR) {
    if (need.type == 'mark' || need.type == 'buildWeapon' || need.type == 'plantItem') {
      return false
    } else if (need.type == 'giveItem') {
      if (need.foundInRaid == false) {
        return false
      }
    }
  }

  if (userStore.itemsTeamAllHidden) {
    // Only show if the objective is needed by ourself
    return !progressStore.tasksCompletions[need.taskId]?.self && !progressStore.objectiveCompletions[need.id]?.self && ['Any', tarkovStore.getPMCFaction].some(faction => faction == relatedTask.value.factionName)
  } else if (userStore.itemsTeamNonFIRHidden) {
    // Only show if a someone needs the objective 
    return need.foundInRaid &&
      // Check if any user has not completed the task (and that its a relevant faction task for them)
      Object.entries(progressStore.tasksCompletions[need.taskId]).some(([userTeamId, userStatus]) => ['Any', progressStore.playerFaction[userTeamId]].some(faction => faction == relatedTask.value.factionName) && userStatus === false) &&
      // Check if any user has not completed the objective (and that its a relevant faction task for them)
      Object.entries(progressStore.objectiveCompletions[need.id]).some(([userTeamId, userStatus]) => ['Any', progressStore.playerFaction[userTeamId]].some(faction => faction == relatedTask.value.factionName) && userStatus === false)
  } else {
    return Object.entries(progressStore.tasksCompletions[need.taskId])
      .some(([userTeamId, userStatus]) => ['Any', progressStore.playerFaction[userTeamId]]
        .some(faction => faction == relatedTask.value.factionName) && userStatus === false) &&
      Object.entries(progressStore.objectiveCompletions[need.id])
      .some(([userTeamId, userStatus]) => ['Any', progressStore.playerFaction[userTeamId]]
        .some(faction => faction == relatedTask.value.factionName) && userStatus === false)
  }
}

function isHideoutModuleNeeded(need) {
  if (userStore.itemsTeamAllHidden || userStore.itemsTeamHideoutHidden) {
    // Only show if the objective is needed by ourself
    return !progressStore.moduleCompletions[need.hideoutModule.id]?.self && !progressStore.modulePartCompletions[need.id]?.self
  } else {
    return Object.values(progressStore.moduleCompletions[need.hideoutModule.id]).some(userStatus => userStatus === false) && Object.values(progressStore.modulePartCompletions[need.id]).some(userStatus => userStatus === false)
  }
}

const selfCompletedNeed = computed(() => {
  if (props.need.needType == 'taskObjective') {
    return progressStore.tasksCompletions[props.need.taskId]['self'] || progressStore.objectiveCompletions[props.need.id]['self']
  } else if (props.need.needType == 'hideoutModule') {
    return progressStore.moduleCompletions[props.need.hideoutModule.id]['self'] || progressStore.modulePartCompletions[props.need.id]['self']
  } else {
    return false
  }
})

const relatedTask = computed(() => {
  if (props.need.needType == 'taskObjective') {
    return tasks.value.find(t => t.id == props.need.taskId)
  } else {
    return null
  }
})

const selfValid = computed(() => {
  if (props.need.needType == 'taskObjective') {
    return relatedTask.value && ['Any', tarkovStore.getPMCFaction].some(faction => faction == relatedTask.value.factionName)
  } else {
    return true
  }
})

const relatedStation = computed(() => {
  if (props.need.needType == 'hideoutModule') {
    return Object.values(hideoutStations.value).find(s => s.id == props.need.hideoutModule.stationId)
  } else {
    return null
  }
})

const lockedBefore = computed(() => {
  if (props.need.needType == 'taskObjective') {
    return relatedTask.value.predecessors.filter((s) => !tarkovStore.isTaskComplete(s.id)).length
  } else if (props.need.needType == 'hideoutModule') {
    return props.need.hideoutModule.predecessors.filter((s) => !tarkovStore.isHideoutModuleComplete(s.id)).length
  } else {
    return 0
  }
})

const itemImageClasses = computed(() => {
  return {
    [`item-bg-${item.value.backgroundColor}`]: true,
    'rounded': true,
    'elevation-2': true,
    'item-image': true,
    'pa-1': true,
  }
})

const currentCount = computed(() => {
  if (props.need.needType == 'taskObjective') {
    return tarkovStore.getObjectiveCount(props.need.id)
  } else if (props.need.needType == 'hideoutModule') {
    return tarkovStore.getHideoutPartCount(props.need.id)
  } else {
    return 0
  }
})

const decreaseCount = () => {
  if (props.need.needType == 'taskObjective') {
    if (currentCount.value > 0) {
      tarkovStore.setObjectiveCount(props.need.id, currentCount.value - 1)
    }
  } else if (props.need.needType == 'hideoutModule') {
    if (currentCount.value > 0) {
      tarkovStore.setHideoutPartCount(props.need.id, currentCount.value - 1)
    }
  }
}

const increaseCount = () => {
  if (props.need.needType == 'taskObjective') {
    if (currentCount.value < props.need.count) {
      tarkovStore.setObjectiveCount(props.need.id, currentCount.value + 1)
    }
  } else if (props.need.needType == 'hideoutModule') {
    if (currentCount.value < props.need.count) {
      tarkovStore.setHideoutPartCount(props.need.id, currentCount.value + 1)
    }
  }
}

const levelRequired = computed(() => {
  if (props.need.needType == 'taskObjective') {
    return relatedTask.value.minPlayerLevel
  } else if (props.need.needType == 'hideoutModule') {
    return 0
  } else {
    return 0
  }
})

const toggleCount = () => {
  if (props.need.needType == 'taskObjective') {
    if (currentCount.value === 0) {
      tarkovStore.setObjectiveCount(props.need.id, props.need.count)
    } else if (currentCount.value === props.need.count) {
      tarkovStore.setObjectiveCount(props.need.id, 0)
    } else {
      tarkovStore.setObjectiveCount(props.need.id, props.need.count)
    }
  } else if (props.need.needType == 'hideoutModule') {
    if (currentCount.value === 0) {
      tarkovStore.setHideoutPartCount(props.need.id, props.need.count)
    } else if (currentCount.value === props.need.count) {
      tarkovStore.setHideoutPartCount(props.need.id, 0)
    } else {
      tarkovStore.setHideoutPartCount(props.need.id, props.need.count)
    }
  }
}



const neededCount = computed(() => {
  if (props.need.needType == 'taskObjective') {
    return props.need.count
  } else if (props.need.needType == 'hideoutModule') {
    return props.need.count
  } else {
    return 0
  }
})

const itemImageSheetClasses = computed(() => {
  return {
    [`item-bg-${item.value.backgroundColor}`]: true,
    'rounded': true,
  }
})

const item = computed(() => {
  if (props.need.needType == 'taskObjective') {
    if (props.need.type == 'mark') {
      return props.need.markerItem
    } else if (props.need.type == 'buildWeapon') {
      return props.need.item
    } else if (props.need.type == 'plantItem') {
      return props.need.item
    } else if (props.need.type == 'giveItem') {
      return props.need.item
    } else {
      return null
    }
  } else if (props.need.needType == 'hideoutModule') {
    return props.need.item
  } else {
    return null
  }
})
</script>
<style lang="scss">
.item-panel {
  aspect-ratio: 16/9;
  min-height: 100px;
}

.item-image {
  min-height: 90px;
}

.item-bg-violet {
  background-color: #2c232f;
}

.item-bg-grey {
  background-color: #1e1e1e;
}

.item-bg-yellow {
  background-color: #343421;
}

.item-bg-orange {
  background-color: #261d14;
}

.item-bg-green {
  background-color: #1a2314;
}

.item-bg-red {
  background-color: #38221f;
}

.item-bg-default {
  background-color: #3a3c3b;
}

.item-bg-black {
  background-color: #141614;
}

.item-bg-blue {
  background-color: #202d32;
}
</style>