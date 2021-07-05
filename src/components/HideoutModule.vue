<template>
  <material-card
    :color="moduleColor"
  >
    <template v-slot:heading>
      <img
        :src="$root.hideoutStationDictionary[moduleDetails.stationId].imgSource"
        class="pa-2"
      >
    </template>
    <template v-slot:title>
      {{ moduleDetails.module }}
      <span class="module-level">
        {{ $t('level') }} {{ moduleDetails.level }}
      </span>
    </template>

    <v-card-text>
      <div class="text-center mb-2">
        {{ $root.hideoutStationDictionary[moduleDetails.stationId].function }}
      </div>
      <div
        v-for="requirement in moduleDetails.require"
        :key="requirement.id"
        class="text-left"
        :class="haveRequirement(requirement)"
      >
        <span v-if="requirement.type === 'module'"><v-icon>mdi-home</v-icon></span>
        <span v-else-if="requirement.type === 'skill'"><v-icon>mdi-run</v-icon></span>
        <span v-else-if="requirement.type === 'currency'"><v-icon>mdi-cash-multiple</v-icon></span>
        <span v-if="requirement.type =='item'">
          <tarkov-item :id="requirement.name" format="small" :count="requirement.quantity" :externalLinks="true" />
        </span>
        <span v-else-if="requirement.type === 'module'">{{ requirement.name }} Level {{ requirement.quantity }} </span>
        <span v-else>{{ requirement.quantity.toLocaleString() }} {{ requirement.name }}</span>
      </div>
    </v-card-text>
    <template v-slot:actions>
      <span v-if="pageType === 'available'">
        <v-btn
          class="warning"
          small
          @click="clickCompleteModule(moduleDetails)"
        >{{ $t('build') }}</v-btn>
      </span>
      <span v-else-if="pageType === 'current'">
        <v-btn
          class="error"
          small
          @click="clickUncompleteModule(moduleDetails)"
        >{{ $t('downgrade') }}</v-btn>
      </span>
    </template>
  </material-card>
</template>
<script>
  export default {
    name: 'HideoutModule',
    props: {
      moduleDetails: Object,
      pageType: String,
    },
    data () {
      return {

      }
    },
    computed: {
      moduleColor: function () {
        if (this.pageType == 'current') {
          return 'success'
        } else if (this.pageType == 'available') {
          return 'warning'
        } else if (this.pageType == 'locked') {
          return 'error'
        } else {
          return 'success'
        }
      },
    },
    methods: {
      refreshHideout () {
        this.$emit('hideoutStateChanged')
      },
      getModuleData (moduleName, moduleLevel) {
        var tempHideout = this.hideoutDataDefault.modules
        // Find the right module
        for (var z = tempHideout.length - 1; z >= 0; z--) {
          if (tempHideout[z].module == moduleName && tempHideout[z].level == moduleLevel) {
            return tempHideout[z]
          }
        }
        return null
      },
      haveRequirement (requirement) {
        var have = false
        if (this.pageType == 'current') {
          have = true
        } else {
          if (requirement.type === 'module') {
            have = this.isModuleCompleted(requirement.name, requirement.quantity)
          } else {
            have = this.$store.get('progress/hideout_objective_have', requirement.id) == requirement.quantity
          }
        }

        return { 'objective-enough': have }
      },
      clickUncompleteModule (moduleData) {
        this.uncompleteModule(moduleData.module, moduleData.level)
      },
      uncompleteModule (moduleName, moduleLevel) {
        var tempHideout = this.hideoutDataDefault.modules
        var tempModuleData = this.getModuleData(moduleName, moduleLevel)

        // Mark this module as not built
        this.$store.set('progress/uncomplete_hideout', tempModuleData.id)
        // Mark all of the requirements for this module as complete
        for (var i = tempModuleData.require.length - 1; i >= 0; i--) {
          this.$store.set('progress/uncomplete_hideout_objective', tempModuleData.require[i].id)
        }
        // Search for this module as a requirement for other modules, and mark it as complete
        for (i = tempHideout.length - 1; i >= 0; i--) {
          for (var x = tempHideout[i].require.length - 1; x >= 0; x--) {
            // If requirement is a module, and its this module, mark it as complete
            if (tempHideout[i].require[x].type == 'module' && tempHideout[i].require[x].name == moduleName && tempHideout[i].require[x].quantity <= moduleLevel) {
              this.$store.set('progress/uncomplete_hideout_objective', tempHideout[i].require[x].id)
            }
          }
        }

        this.refreshHideout()

        this.$analytics.logEvent('module_uncomplete', {
          event_category: 'Hideout',
          event_label: `Uncompleted ${moduleName}`,
          quests_previously: this.$store.get('progress/quests_array').filter(x => x.complete).length,
        })
      },
      clickCompleteModule (moduleData) {
        this.completeModule(moduleData.module, moduleData.level)
      },
      completeModule (moduleName, moduleLevel) {
        var tempHideout = this.hideoutDataDefault.modules
        var tempModuleData = this.getModuleData(moduleName, moduleLevel)

        // Mark this module as built
        this.$store.set('progress/complete_hideout', tempModuleData.id)
        // Mark all of the requirements for this module as complete
        for (var i = tempModuleData.require.length - 1; i >= 0; i--) {
          this.$store.set('progress/complete_hideout_objective', tempModuleData.require[i].id)
        }
        // Search for this module as a requirement for other modules, and mark it as complete
        for (i = tempHideout.length - 1; i >= 0; i--) {
          for (var x = tempHideout[i].require.length - 1; x >= 0; x--) {
            // If requirement is a module, and its this module, mark it as complete
            if (tempHideout[i].require[x].type == 'module' && tempHideout[i].require[x].name == moduleName && tempHideout[i].require[x].quantity <= moduleLevel) {
              this.$store.set('progress/complete_hideout_objective', tempHideout[i].require[x].id)
            }
          }
        }

        this.refreshHideout()

        this.$analytics.logEvent('module_complete', {
          event_category: 'Hideout',
          event_label: `Completed ${moduleName}`,
          quests_previously: this.$store.get('progress/quests_array').filter(x => x.complete).length,
        })
      },
    },

  }
</script>
<style lang="sass">
.module-level
  font-size: .8rem !important
  margin-left: auto
  font-weight: bold
</style>
