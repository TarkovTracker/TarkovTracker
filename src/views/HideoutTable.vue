<template>
  <v-container
    id="tabs-view"
    fluid
    tag="section"
  >
    <v-responsive
      max-width="1200"
      class="mx-auto"
    >
      <v-row class="mt-1">
        <v-col
          v-for="module in stateModules"
          :key="module.id"
          cols="12"
          md="6"
          lg="4"
        >
          <hideout-module
            :module-details="module"
            :page-type="availability"
            @hideoutStateChanged="triggerUpdate()"
          />
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
  import hideoutFunctions from '../functions/hideoutFunctions'

  export default {
    components: {
      HideoutModule: () => import('../components/HideoutModule.vue'),
    },
    props: {
      availability: {
        type: String,
      },
    },
    data () {
      return {
        availableModules: [],
        currentModules: [],
        lockedModules: [],
      }
    },
    computed: {
      stateModules: function () {
        if (this.availability == 'current') {
          return this.currentModules
        } else if (this.availability == 'available') {
          return this.availableModules
        } else if (this.availability == 'locked') {
          return this.lockedModules
        } else {
          return []
        }
      },
    },
    metaInfo: {
      // Children can override the title.
      title: 'Hideout',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Track needed items & progression routes for upgrading your hideout in Escape From Tarkov.' },
      ],
    },
    mounted () {
      this.refreshHideout()
    },
    methods: {
      triggerUpdate () {
        this.refreshHideout()
        this.$emit('hideoutStateChanged')
      },
      refreshHideout () {
        this.availableModules = []
        this.currentModules = []
        this.lockedModules = []
        var tempHideout = this.hideoutDataDefault.modules

        if (this.$store.get('progress/dataVersion') < 2) {
          for (let level = 1; level <= this.$store.get('progress/gameEdition'); level++) {
            let module = hideoutFunctions.getHideoutModule("stash", level);
            if (!this.$store.get('progress/hideout_complete', module.id)) {
              this.$store.set('progress/complete_hideout', module.id);
              hideoutFunctions.completeModuleObjective(this.$store, 'stash', level);
            }
          }
          this.$store.set('progress/set_data_version', 2);
        }

        var uniqueModules = new Set()
        // Scan all of the default hideout data and get unique modules
        for (let i = tempHideout.length - 1; i >= 0; i--) {
          if (this.$root.hideoutStationDictionary[tempHideout[i].stationId].disabled != true) {
            uniqueModules.add(tempHideout[i].module)
          }
        }
        // Check for locked modules
        for (const curModule of uniqueModules) {
          // Loop through all the modules until we find the level 1 version of this
          for (let z = tempHideout.length - 1; z >= 0; z--) {
            if (tempHideout[z].module == curModule && tempHideout[z].level == 1) {
              // We found the matching module level 1
              // Loop through all the requirements for this, and find modules that could block
              let isLocked = false
              isLocked = this.isModuleLocked(tempHideout[z].module, tempHideout[z].level)
              if (isLocked) {
                this.lockedModules.push(tempHideout[z])
              } else if (this.isModuleCompleted(curModule, 1) == false) {
                this.availableModules.push(tempHideout[z])
              }
            }
          }
        }

        // Check for currently completed modules
        for (const curModule of uniqueModules) {
          // Check the highest level of this module we've completed
          let highestCurrent = this.highestCompleted(curModule)
          if (highestCurrent >= 1) {
            // Find the module object
            for (let i = tempHideout.length - 1; i >= 0; i--) {
              if (tempHideout[i].module == curModule && tempHideout[i].level == highestCurrent) {
                this.currentModules.push(tempHideout[i])

                // Is there an upgraded version of this module?
                let upgradedModule = hideoutFunctions.getHideoutModule(tempHideout[i].module, tempHideout[i].level + 1)
                if (upgradedModule != null) {
                  if (!(this.isModuleLocked(upgradedModule.module, upgradedModule.level))) {
                    // Upgraded module is not locked, so add it to the available modules
                    this.availableModules.push(upgradedModule)
                  } else {
                    this.lockedModules.push(upgradedModule)
                  }
                }
              }
            }
          }
        }
      },
      isModuleLocked (moduleName, moduleLevel) {
        var tempHideout = this.hideoutDataDefault.modules
        var isLocked = false
        // Loop through all the modules until we find the level 1 version of this
        for (var z = tempHideout.length - 1; z >= 0; z--) {
          if (tempHideout[z].module == moduleName && tempHideout[z].level == moduleLevel) {
            // Loop through all the requirements for this, and find modules that could block
            for (var x = tempHideout[z].require.length - 1; x >= 0; x--) {
              if (tempHideout[z].require[x].type == 'module') {
                // Check if the module required is completed, and if not, mark this as a locked module
                if (this.isModuleCompleted(tempHideout[z].require[x].name, tempHideout[z].require[x].quantity) == false) {
                  isLocked = true
                }
              }
            }
          }
        }
        return isLocked
      },
      highestCompleted (moduleName) {
        var tempHideout = this.hideoutDataDefault.modules
        // Find the correct module first
        var highestFound = 0
        for (var z = tempHideout.length - 1; z >= 0; z--) {
          // Check the module name and level
          if (tempHideout[z].module == moduleName && this.$store.get('progress/hideout_complete', tempHideout[z].id) && tempHideout[z].level > highestFound) {
            highestFound = tempHideout[z].level
          }
        }
        return highestFound
      },
    },
  }
</script>
