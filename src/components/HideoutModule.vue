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
        Level {{ moduleDetails.level }}
      </span>
    </template>

    <v-card-text>
      <div class="text-center mb-2">
        {{ $root.hideoutStationDictionary[moduleDetails.stationId].function }}
      </div>
      <div
        v-for="requirement in moduleDetails.require"
        v-if="!modificationDisabled(moduleDetails)"
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
        <span v-else-if="requirement.type === 'trader'">
          <trader-tag :id="parseInt(requirement.name)" :loyalty="requirement.quantity"/>
        </span>
        <span v-else-if="requirement.type === 'module'">{{ requirement.name }} Level {{ requirement.quantity }} </span>
        <span v-else>{{ requirement.quantity.toLocaleString() }} {{ requirement.name }}</span>
      </div>
    </v-card-text>
    <template v-slot:actions>
      <span v-if="pageType === 'available' && !modificationDisabled(moduleDetails)">
        <v-btn
          class="warning"
          small
          @click="clickCompleteModule(moduleDetails)"
        >Build</v-btn>
      </span>
      <span v-else-if="pageType === 'current' && !modificationDisabled(moduleDetails)">
        <v-btn
          class="error"
          small
          @click="clickUncompleteModule(moduleDetails)"
        >Downgrade</v-btn>
      </span>
      <span v-else-if="pageType === 'locked' && !modificationDisabled(moduleDetails)">
        <v-btn
          class="warning upgrade-hideout"
          small
          @click="clickCompleteModule(moduleDetails)"
        >Build anyway</v-btn>
        <v-btn
          v-for="level in getLockedLevels(moduleDetails)"
          class="warning upgrade-hideout"
          small
          :key="level"
          @click="clickCompleteModule(moduleDetails)"
        >Level {{level}}</v-btn>
      </span>
    </template>
  </material-card>
</template>
<script>
  import hideoutFunctions from '../functions/hideoutFunctions'

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
      getLockedLevels(module) {
        let lockedLevels = [];
        let MAX_ITERATIONS = 10;
        for (let level = module.level + 1; level < MAX_ITERATIONS; level++) {
          let nextLevelModule = hideoutFunctions.getHideoutModule(module.module, level);
          if (!nextLevelModule) {
            break;
          }
          lockedLevels.push(level)
        }
        return lockedLevels;
      },
      refreshHideout () {
        this.$emit('hideoutStateChanged')
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
      modificationDisabled(module) {
        return module.module.toLowerCase() === 'stash' && module.level <= this.$store.get('progress/gameEdition');
      },
      clickUncompleteModule (moduleData) {
        this.uncompleteModule(moduleData.module, moduleData.level)
      },
      uncompleteModule (moduleName, moduleLevel) {
        var tempHideout = this.hideoutDataDefault.modules

        // Ignore any upgrades/downgrades on Stash upgrade if user has EOD edition
        if (moduleName.toLowerCase() === 'stash' && moduleLevel <= this.$store.get('progress/gameEdition')) {
          return;
        }

        var tempModuleData = hideoutFunctions.getHideoutModule(moduleName, moduleLevel)

        if (!this.$store.get('progress/complete_hideout', tempModuleData.id)) {
          return;
        }

        // Mark all hideouts that require this module also as incomplete (in case of downgrading modules while already having
        // another module dependant on this module)
        tempHideout.forEach(module => {
          module.require.forEach(requirement => {
            if (requirement.type === 'module' && requirement.name === moduleName && requirement.quantity === moduleLevel) {
              this.uncompleteModule(module.module, module.level);
            }
          });
        });

        hideoutFunctions.uncompleteModule(this.$store, tempModuleData.id);
        hideoutFunctions.uncompleteModuleObjective(this.$store, moduleName, moduleLevel);

        this.refreshHideout()

        this.$analytics.logEvent('module_uncomplete', {
          event_category: 'Hideout',
          event_label: `Uncompleted ${moduleName}`,
          quests_previously: this.$store.get('progress/quests_array').filter(x => x.complete).length,
        })
      },
      clickCompleteModuleLevel (moduleName, moduleLevel) {
        this.completeModule(moduleName, moduleLevel);
      },
      clickCompleteModule (moduleData) {
        this.completeModule(moduleData.module, moduleData.level)
      },
      completeModule (moduleName, moduleLevel) {
        var tempHideout = this.hideoutDataDefault.modules

        // Ignore any upgrades/downgrades on Stash upgrade if user has EOD edition
        if (moduleName.toLowerCase() === 'stash' && moduleLevel <= this.$store.get('progress/gameEdition')) {
          return;
        }

        var tempModuleData = hideoutFunctions.getHideoutModule(moduleName, moduleLevel)

        if (this.$store.get('progress/complete_hideout', tempModuleData.id)) {
          return;
        }

        // Mark all requirements as complete (in case of completing locked modules)
        tempModuleData.require.forEach(requirement => {
            if (requirement.type === 'module') {
              this.completeModule(requirement.name, requirement.quantity);
            }
        });

        hideoutFunctions.completeModule(this.$store, tempModuleData.id);
        hideoutFunctions.completeModuleObjective(this.$store, moduleName, moduleLevel);

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
.upgrade-hideout
  margin-right: 10px
</style>
