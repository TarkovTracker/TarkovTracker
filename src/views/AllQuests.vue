<template>
  <v-container
    id="grid-view"
    fluid
    tag="section"
  >
    <v-row>
      <v-col
        lg="4"
        md="12"
        class="my-1 py-1"
      >
        <v-sheet
          color="success"
          width="100%"
          elevation="6"
          max-width="100%"
          rounded
        >
          <v-theme-provider dark>
            <v-tabs
              v-model="activeViewTab"
              background-color="transparent"
              color="white"
              slider-color="white"
              center-active
              centered
              height="36px"
            >
              <v-tab
                v-for="view in views"
              >
                <v-icon class="mr-2">
                  {{ view.icon }}
                </v-icon>
                  {{ view.title }}
              </v-tab>
            </v-tabs>
          </v-theme-provider>
        </v-sheet>
      </v-col>
      <v-col
        lg="8"
        md="12"
        v-if="activeViewTab == 0"
        class="my-1 py-1"
      >
        <v-sheet
          color="success"
          width="100%"
          elevation="6"
          max-width="100%"
          rounded
        >
          <v-theme-provider dark>
            <v-tabs
              background-color="transparent"
              color="white"
              slider-color="white"
              center-active
              centered
              height="36px"
            >
              <v-tab>
                <v-icon class="mr-2">
                  mdi-compass
                </v-icon>
                  Everything
              </v-tab>
            </v-tabs>

          </v-theme-provider>
        </v-sheet>
      </v-col>
      <v-col
        lg="8"
        md="12"
        v-if="activeViewTab == 1"
        class="my-1 py-1"
      >
        <v-sheet
          color="success"
          width="100%"
          elevation="6"
          max-width="100%"
          rounded
        >
          <v-theme-provider dark>
            <v-tabs
              v-model="activeMapTab"
              background-color="transparent"
              color="white"
              slider-color="white"
              center-active
              centered
              height="36px"
            >
              <v-tab
                v-for="map in maps"
              >
                <v-icon class="mr-2">
                  mdi-compass
                </v-icon>
                <v-badge
                  :value="activeAvailableTab == 0 && $root.mapAvailability[map] >= 1"
                  color="primary"
                  :content="$root.mapAvailability[map]"
                >
                  {{ map }}
                </v-badge>
              </v-tab>
            </v-tabs>
          </v-theme-provider>
        </v-sheet>
      </v-col>
      <v-col
        lg="8"
        md="12"
        v-if="activeViewTab == 2"
        class="my-1 py-1"
      >
        <v-sheet
          color="success"
          width="100%"
          elevation="6"
          max-width="100%"
          rounded
        >
          <v-theme-provider dark>
            <v-tabs
              v-model="activeTraderTab"
              background-color="transparent"
              color="white"
              slider-color="white"
              center-active
              centered
              height="36px"
            >
              <v-tab
                v-for="trader in traders"
              >
                <v-avatar
                  color="primary"
                  size="2em"
                  class="mr-2"
                >
                  <img
                    :src="traderIcon(trader.id)"
                    :alt="trader.locale.en"
                  >
                </v-avatar>
                  {{ trader.locale.en }}
              </v-tab>
            </v-tabs>
          </v-theme-provider>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        lg="4"
        md="12"
        class="my-1 py-1"
      >
        <v-sheet
          color="success"
          width="100%"
          elevation="6"
          max-width="100%"
          rounded
        >
          <v-theme-provider dark>
            <v-tabs
              v-model="activeAvailableTab"
              background-color="transparent"
              color="white"
              slider-color="white"
              center-active
              centered
              @change="availableTabChange"
              height="36px"
            >
              <v-tab
                v-for="availability in availabilities"
              >
                <v-icon class="mr-2">
                  {{ availability.icon }}
                </v-icon>
                  {{ availability.title }}
              </v-tab>
            </v-tabs>
          </v-theme-provider>
        </v-sheet>
      </v-col>
      <v-col
        lg="8"
        md="12"
        class="my-1 py-1"
      >
        <v-sheet
          color="success"
          width="100%"
          elevation="6"
          max-width="100%"
          rounded
        >
          <v-theme-provider dark>
            <v-tabs
              v-model="activeTeamTab"
              background-color="transparent"
              color="white"
              slider-color="white"
              center-active
              centered
              height="36px"
            >
              <v-tab
                v-for="(teammate, index) in visibleTeam"
                :class="teamTabClasses(teammate, index)"
                :disabled="index == 0 && [1, 2].includes(activeAvailableTab) && visibleTeam.length > 1"
              >
                  <template v-if="visibleTeam.length > 1 && index == 0">
                    <v-icon class="mr-2">
                      mdi-account-group
                    </v-icon>
                    Team
                  </template>
                  <template v-else>
                    <v-icon class="mr-2">
                      mdi-account
                    </v-icon>
                    <teammate-identity :teammate="teammate" />
                  </template>
              </v-tab>
            </v-tabs>
          </v-theme-provider>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-expansion-panels 
        class="mx-3 mt-2"
        inset
      >
        <v-expansion-panel>
          <v-expansion-panel-header
            color="success"
            disable-icon-rotate
            class="small-panels py-1 px-3"
          >
            <template v-slot:default="{ open }">
              <v-row no-gutters>
                <v-col cols="auto">
                  Filters
                </v-col>
                <v-col
                  cols="auto"
                  class="text--secondary ml-auto mr-auto"
                >
                  <v-fade-transition leave-absolute>
                    <span v-if="!open">
                      Hiding {{ totalHidden }} quests 
                      <span v-if="onlyKappa && filterCounts.kappa > 0">
                        ({{ filterCounts.kappa }} Non-Kappa)
                      </span>
                      <span v-if="onlyLevels && filterCounts.level > 0">
                        ({{ filterCounts.level }} Above Level)
                      </span>
                      <span v-if="$root.team.filter(teammate => teammate.hide).length > 0">
                        - Hiding {{ $root.team.filter(teammate => teammate.hide).length }} teammates
                      </span>
                    </span>
                    
                  </v-fade-transition>
                </v-col>
              </v-row>
            </template>
            <template v-slot:actions>
              <v-icon>
                mdi-clipboard-text-search-outline
              </v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content
            color="success"
            elevation="6"
          >
            <v-row
              no-gutters
              class="mt-1 ml-auto mr-auto"
            >
              <v-col 
                lg="3"
                md="8"
                xs="12"
                class="mx-3 ml-auto"
              >
                <v-row
                  no-gutters
                  class="mt-1"
                >
                  Objectives
                </v-row>
                <v-row
                  no-gutters
                  class="mt-1"
                >
                  <v-checkbox
                    v-model="onlyKappa"
                    label="Hide Non-Kappa Quests"
                    color="white"
                    class="mt-1"
                  ></v-checkbox>
                </v-row>
              </v-col>
              <v-divider
                vertical
                class="hidden-md-and-down"
              ></v-divider>
              <v-col
                lg="3"
                md="8"
                xs="12"
                class="mx-3"
              >
                <v-row
                  no-gutters
                  class="mt-1"
                >
                Experience
                </v-row>
                <v-row
                  no-gutters
                  class="mt-1"
                >
                  <v-checkbox
                    v-model="onlyLevels"
                    label="Hide Quests Above Level"
                    color="white"
                    class="mt-0"
                    title="Hides quests that aren't available to you (and any teammates) by level requirement"
                    dense
                  ></v-checkbox>
                </v-row>
                <v-row
                  no-gutters
                  class="mt-1"
                >
                  <v-slider
                    v-model="selfLevel"
                    label="Level"
                    step="1"
                    min="1"
                    max="71"
                    :thumb-size="24"
                    thumb-label="always"
                    ticks
                    dense
                  ></v-slider>
                </v-row>
              </v-col>
              <v-divider
                vertical
                class="hidden-md-and-down"
              ></v-divider>
              <v-col
                lg="3"
                md="8"
                xs="12"
                class="mx-3 mr-auto"
              >
                <v-row
                  no-gutters
                  class="mt-1"
                >
                Sorting
                </v-row>
                <v-row
                  no-gutters
                  class="mt-1"
                >
                  <v-select
                    v-model="primarySort"
                    :items="primarySortOptions"
                    label="Sort quests by"
                    item-text="title"
                    item-value="value"
                    color="white"
                    item-color="white"
                    dense
                    outlined
                  ></v-select>
                </v-row>
                <v-row
                  no-gutters
                  class="mt-1"
                >
                  <v-select
                    v-model="teamSort"
                    :items="teamSortOptions"
                    label="Sort team's quests by"
                    item-text="title"
                    item-value="value"
                    color="white"
                    item-color="white"
                    dense
                    outlined
                  ></v-select>
                </v-row>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-expansion-panels 
        class="mx-3 mt-3"
        inset
        v-show = "(bringKeys.length > 0 && activeViewTab == 1 && activeAvailableTab == 0) || (Object.keys(bringItems).length != 0 && activeViewTab == 1 && activeAvailableTab == 0)"
        v-model="showPacking"
      >
        <v-expansion-panel>
          <v-expansion-panel-header
            disable-icon-rotate
            class="small-panels py-1 px-3"
          >
              <v-row no-gutters>
                <v-col cols="auto">
                  Packing List
                </v-col>
                <v-col
                  cols="auto"
                  class="text--secondary ml-auto mr-auto"
                >
                  Items to bring  
                </v-col>
              </v-row>
            <template v-slot:actions>
              <v-icon>
                mdi-package-variant
              </v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content
            color="contentbackground"
          >
              <v-row>
                <!-- If we have keys needed, set up the grid for that -->
                <v-col 
                  v-if="bringKeys.length > 0 && activeViewTab == 1 && activeAvailableTab == 0"
                  :lg="3"
                  :sm="12"
                  class="mx-auto"
                >
                  <v-icon>mdi-key</v-icon> <b>Keys:</b>
                  <div
                    v-for="keyObjective in bringKeys"
                    :key="keyObjective.id"
                  >
                    <div style="font-weight: 400">
                      <div v-if="Array.isArray(keyObjective.target)">
                        <v-divider></v-divider>
                        <div
                          v-for="(keyOptional, keyIndex) in keyObjective.target"
                          :key="keyIndex"
                        >
                          <tarkov-item :id="keyOptional" format="small" :externalLinks="true" />
                          <div v-if="keyIndex < keyObjective.target.length - 1" class="text-center">
                            OR
                          </div>
                        </div>
                        <v-divider></v-divider>
                      </div>
                      <div v-else>
                        <tarkov-item :id="keyObjective.target" format="small" :externalLinks="true" />
                      </div>
                    </div>
                  </div>
                </v-col>

                <!-- If we have items needed, set up that grid -->
                <v-col 
                  v-if="Object.keys(bringItems).length != 0 && activeViewTab == 1 && activeAvailableTab == 0"
                  :lg="3"
                  :sm="12"
                  class="mx-auto"
                >
                  <v-icon>mdi-package-variant</v-icon> <b>Items:</b>
                  <div
                    v-for="(itemCount, itemObjective) in bringItems"
                    :key="itemObjective"
                  >
                    <tarkov-item :id="itemObjective" format="small" :count="itemCount" :externalLinks="true" />
                  </div>
                </v-col>
              </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-expansion-panels 
        class="mx-3 mt-3"
        inset
        v-if = "activeViewTab == 1 && activeAvailableTab == 0 && activeMapTab < (maps.length - 1)"
        v-model="showObjectiveMap"
      >
        <v-expansion-panel>
          <v-expansion-panel-header
            disable-icon-rotate
            class="small-panels py-1 px-3"
          >
              <v-row
                no-gutters
                class="mt-1 ml-auto mr-auto"
              >
                <v-col cols="auto">
                  Objective Map
                </v-col>
                <v-col
                  cols="auto"
                  class="text--secondary mx-auto"
                  v-if="$root.mapDictionary[activeMapTab].svg == null && showObjectiveMap == undefined"
                >
                  No map yet available for {{ maps[activeMapTab] }}  
                </v-col>
              </v-row>
            <template v-slot:actions>
              <v-icon>
                mdi-map-marker-radius
              </v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content
            color="contentbackground"
          >
            <v-row>
              <v-col
                v-if="$root.mapDictionary[activeMapTab].svg == null"
                class="mx-auto"
                cols="auto"
              >
                Know how to work with Illustrator, or SVGs? Want to help create this map? Head over to <a href="https://github.com/TarkovTracker/tarkovdata/tree/master/maps" target="_blank" class="quest-link">tarkovdata.io</a>!
              </v-col>
              <v-col
                  v-else
                  cols="12"
                  class=""
                >
                  <tarkov-map :mapId="activeMapTab" :layerControls="true" />
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
    <v-row>
      <v-card
        width="100%"
        class="ma-3 pa-3"
      >

        <div v-if="primaryQuests.length == 0 && activeMapTab != 7" class="text-center ma-3 mb-5">
          <v-icon>mdi-help-circle</v-icon>No quests found for specified filter
        </div>

        <quest-row
          v-for="quest in primaryQuests"
          :key="quest.id"
          :quest-details="quest"
          :page-type="availabilities[activeAvailableTab].title.toLowerCase()"
        />
        <v-container
          v-if="activeMapTab != 7 && globalQuests.length > 0"
        >
          <v-row>
            <v-sheet
              color="success"
              width="100%"
              elevation="6"
              max-width="100%"
              class="pa-3 text-center"
              rounded
            >
              <v-icon>
                public
              </v-icon>
              Globally available quests
            </v-sheet>
          </v-row>
        </v-container>
        <quest-row
          v-for="quest in globalQuests"
          :key="quest.id"
          :quest-details="quest"
          :page-type="availabilities[activeAvailableTab].title.toLowerCase()"
        />
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
  import orderBy from 'lodash/orderBy';
  export default {
    props: {
      viewType: {
        type: String,
      },
      subView: {
        type: String,
      },
    },
    data () {
      return {
        showPacking: 0,
        showObjectiveMap: 0,
        progressValue: 0,
        activeTeamTab: 0,
        activeAvailableTab: 0,
        views: [
          {title: 'All', icon: 'mdi-clipboard-check'},
          {title: 'Maps', icon: 'mdi-compass'},
          {title: 'Traders', icon: 'mdi-account'}
        ],
        availabilities: [
          {title: 'Available', icon: 'mdi-clipboard-text'},
          {title: 'Locked', icon: 'mdi-lock'},
          {title: 'Completed', icon: 'mdi-clipboard-check'}
        ],
        filterCounts: {
          kappa: 0,
          level: 0,
          loyalty: 0
        },
        primarySortOptions: [
          { title: 'Quests Locked Behind', value: 0 },
          { title: 'Level Requirement', value: 1 }
        ],
        teamSortOptions: [
          { title: 'With Normal Sorting', value: 0 },
          { title: 'Before My Quests', value: 1 },
          { title: 'After My Quests', value: 2 }
        ],
      }
    },
    metaInfo: {
      // Children can override the title.
      title: 'Quests',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Find quests, plan your raid, and collaborate with your team to complete tasks. All the information you\'ll need including items to bring!' },
      ],
    },
    computed: {
      maps: function() {
        return this.$root.mapArray.reduce((acc, x) => acc.concat(x.locale.en), []).concat('Global')
      },
      onlyKappa: {
        get () {
          return this.$store.copy('user/onlyKappa') || false
        },
        set (value) {
          this.$store.set('user/onlyKappa', value)
        },
      },
      onlyLevels: {
        get () {
          return this.$store.copy('user/onlyLevels') || false
        },
        set (value) {
          this.$store.set('user/onlyLevels', value)
        },
      },
      selfLevel: {
        get () {
          return this.$store.copy('progress/level') || 71
        },
        set (value) {
          this.$store.set('progress/level', value)
        },
      },
      primarySort: {
        get () {
          return this.$store.copy('user/primarySort') || 0
        },
        set (value) {
          this.$store.set('user/primarySort', value)
        },
      },
      teamSort: {
        get () {
          return this.$store.copy('user/teamSort') || 0
        },
        set (value) {
          this.$store.set('user/teamSort', value)
        },
      },
      activeViewTab: {
        get () {
          return this.$store.copy('user/questViewTab') || 0
        },
        set (value) {
          this.$store.set('user/questViewTab', value)
        },
      },
      activeMapTab: {
        get () {
          return this.$store.copy('user/questMapTab') || 0
        },
        set (value) {
          this.$store.set('user/questMapTab', value)
        },
      },
      activeTraderTab: {
        get () {
          return this.$store.copy('user/questTraderTab') || 0
        },
        set (value) {
          this.$store.set('user/questTraderTab', value)
        },
      },
      showAnyFromTeam() {
        return (this.activeTeamTab == 0 && this.visibleTeam.length > 1) || this.visibleTeam.length == 1
      },
      totalHidden: function() {
        return Object.values(this.filterCounts).reduce((a, b) => a + b, 0)
      },
      traders: function() {
        return Object.values(this.traderDataDefault) // Get an array of traders
          .filter(trader => trader.id != 7) // Remove Fence from that array
      },
      primarySortOrder: function() {
        switch(this.primarySort) {
          case 0:
            return 'desc'
            break;

          case 1:
            return 'asc'
            break;

          default:
            return 'desc'
            break;
        }
      },
      visibleTeam: function() {
        if(this.$root.team.length > 1) {
          return ['Team', ...this.$root.team]
        }else{
          return this.$root.team
        }
      },
      filteredQuests: function() {
        // Get a copy of all quests
        var quests = this.$root.questArrayCopy()

        switch(this.activeViewTab) {
          case 0: // The 'All' view
            quests = quests
            break;

          case 1: // The 'Maps' view
            // Global should always be the last tab
            if( this.activeMapTab == (this.maps.length - 1) ) {
              // We want to see global quests
              quests = quests.filter(quest => this.isQuestOnMap(quest) != false)
            }else{
              quests = quests.filter(quest => this.$root.questsByMap[this.activeMapTab].has(quest.id))
              quests = quests.map(quest => this.isQuestOnMap(quest, this.activeMapTab))
            }
            break;

          case 2: // The 'Traders' view
            quests = quests.filter(quest => quest.giver == this.traders[this.activeTraderTab].id)
            break;

          default:

            break;
        }

        switch(this.activeAvailableTab) {
          case 0: // The 'Available' view
            if ( this.showAnyFromTeam ) {
              // Were viewing ourself, normal use case, show everything available currently
              quests = quests.filter(quest => Object.values(this.$root.questAvailability[quest.id]).includes(0))
            }else{
              // We specifically want to see what another teammate has available
              quests = quests.filter(quest => this.$root.questAvailability[quest.id][this.activeTeamTab - 1] == 0)
            }

            // If we're choosing to limit by levels
            if (this.onlyLevels) {
              var beforeCount = quests.length
              if (this.showAnyFromTeam ) {
                // Check if any member who has the quest available is also level appropriate
                quests = quests.filter(quest => this.$root.team.some((teammate, index) => {
                  return this.$root.questAvailability[quest.id][index] == 0 &&
                  this.$root.levelAvailability[quest.id][index] == true
                }))
              }else{
                quests = quests.filter(quest => this.$root.levelAvailability[quest.id][this.activeTeamTab - 1] == true)
              }
              
              this.filterCounts.level = beforeCount - quests.length
            }else{
              this.filterCounts.level = 0
            }
            break;

          case 1: // The 'Locked' view (show locked specifically for yourself)
            if ( this.showAnyFromTeam ) {
              // Were viewing ourself, normal use case, show everything available currently
              quests = quests.filter(quest => this.$root.questAvailability[quest.id][0] <= -1)
            }else{
              // We specifically want to see what another teammate has available
              quests = quests.filter(quest => this.$root.questAvailability[quest.id][this.activeTeamTab - 1] <= -1)
            }
            break;

          case 2: // The 'Completed' view (show completed specifically for yourself)
            if ( this.showAnyFromTeam ) {
              // Were viewing ourself, normal use case, show everything available currently
              quests = quests.filter(quest => this.$root.questAvailability[quest.id][0] == 1)
            }else{
              // We specifically want to see what another teammate has available
              quests = quests.filter(quest => this.$root.questAvailability[quest.id][this.activeTeamTab - 1] == 1)
            }
            break;

          default:
            quests = quests
            break;
        }

        // Filter out non-kappa quests
        if(this.onlyKappa) {
          var beforeCount = quests.length
          quests = quests.filter(quest => quest.nokappa != true)
          this.filterCounts.kappa = beforeCount - quests.length
        }else{
          this.filterCounts.kappa = 0
        }

        quests = orderBy(quests, [function(quest) { return this.questTeamSort(quest) }.bind(this), function(quest) { return this.questPrimarySort(quest) }.bind(this)], ['asc', this.primarySortOrder])
        //quests.sort( (a, b) => (this.questPrimarySort(a, b)) || this.questTeamSort(a, b) )

        return quests
      },
      primaryQuests: function() {
        // We're viewing the maps tab, the primary quests are just map specific
        if (this.activeViewTab == 1) {
          return this.filteredQuests.filter(quest => this.isQuestMapSpecific(quest))
        }else{
          return this.filteredQuests
        }
      },
      globalQuests: function() {
        if (this.activeViewTab == 1) {
          return this.filteredQuests.filter(quest => this.isQuestMapSpecific(quest) != true)
        }else{
          return []
        }
      },
      bringItems: function () {
        var allItems = this.filteredQuests
          .filter(quest => this.$root.questAvailability[quest.id][0] == 0) // Only include quests that we're on, not teammates
          .reduce((acc, x) => acc.concat(x.objectives), []) // Get a flat list of objectives
          .reduce((items, item) => items.find(x => x.id === item.id) ? [...items] : [...items, item], []) // Filter out duplicate objective IDs in the case of things like Chemical Pt 4
          .filter(y => ['place', 'mark'].indexOf(y.type) >= 0) // Filter them down to things that need items
          .filter(objective => this.$root.objectiveAvailability[objective.id][0] == false) // Only include the item if the objective is incomplete

        var markItems = allItems
          .filter(x => x.type == 'mark') // Find all the mark objectives
          .reduce((acc, y) => acc.concat(y.tool), []) // Get the array of tools from mark objectives

        var placeItems = allItems
          .filter(x => x.type == 'place') // Find all the place objectives
          .reduce((acc, y) => acc.concat(Array(y.number).fill(y.target)), []) // Get the array of targets from place objectives, and add it the number of times we need

        return markItems.concat(placeItems).reduce((acc, value) =>
          ({ ...acc, [value]: acc[value] + 1 || 1 }), {})
      },
      bringKeys: function () {
        return this.filteredQuests
          .reduce((acc, x) => acc.concat(x.objectives), []) // Get a flat list of objectives
          .filter(y => ['key'].indexOf(y.type) >= 0) // Filter them down to key requirements
      },
    },
    mounted () {
      if (this.viewType != null) {
        var validView = this.views.reduce((acc, x) => acc.concat(x.title.toLowerCase()), []).indexOf(this.viewType.toLowerCase())
        if (validView >= 0) {
          this.$store.set('user/questViewTab', validView)
        }
      }

      if (this.$store.copy('user/questViewTab') == 1 && this.subView != null) {
        var validView = this.maps.reduce((acc, x) => acc.concat(x.toLowerCase()), []).indexOf(this.viewType.toLowerCase())
        if (validView >= 0) {
          this.$store.set('user/questMapTab', validView)
        }
      }

      if (this.$store.copy('user/questViewTab') == 2 && this.subView != null) {
        var validView = this.traders.reduce((acc, x) => acc.concat(x.toLowerCase()), []).indexOf(this.viewType.toLowerCase())
        if (validView >= 0) {
          this.$store.set('user/questTraderTab', validView)
        }
      }
    },
    methods: {
      availableTabChange: function (newTab) {
        if ((newTab == 1 || newTab == 2) && this.visibleTeam.length > 1 && this.activeTeamTab == 0) {
          this.activeTeamTab = 1
        }
      },
      // Hide the tab (while keeping it existing for tab index use)
      // Add mr-auto if this is the last visible tab
      teamTabClasses: function (teammate, index) {
        return {
          'd-none': teammate.hide,
          'mr-auto': (index == (this.visibleTeam.length - 1)) || (this.visibleTeam.slice(index + 1).every(mate => mate.hide == true))
        }
      },

      questPrimarySort: function(a) {
        switch(this.primarySort) {
          case 0:
            return this.calculateLocked(a)
            break;

          case 1:
            return a.require.level
            break;

          default:
            break;
        }
        return 0
      },

      questTeamSort: function(a) {
        switch(this.teamSort) {
          case 0:
            break;

          case 1:
            // Only using this sort when viewing available quests, doesn't make sense on locked or completed
            if(this.activeAvailableTab == 0) {
              return !(this.$root.questAvailability[a.id][0] != 0)
            }
            break;

          case 2:
            if(this.activeAvailableTab == 0) {
              return (this.$root.questAvailability[a.id][0] != 0)
            }
            break;

          default:
            break;
        }
        return 0
      }
    },
  }
</script>
<style lang="sass">
.small-panels
  min-height: 36px !important
</style>
