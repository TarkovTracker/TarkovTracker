<template>
  <div>
    <v-simple-table>
      <tbody>
        <!-- Warn if no quests for the map at all -->
        <tr
          v-if="available_quests.length === 0"
          style="text-align:center;"
        >
          <td colspan="3">
            <v-icon>mdi-help-circle</v-icon>There are no available {{ mapName.toLowerCase().capitalize() }} quests - check the trader tabs to get started!
          </td>
        </tr>
        <!-- Warn if no map specific quests -->
        <tr
          v-else-if="sortHere.length === 0"
          style="text-align:center;"
        >
          <td colspan="3">
            <v-icon>mdi-help-circle</v-icon>There are no {{ mapName.toLowerCase().capitalize() }} specific quests available currently!
          </td>
        </tr>
        <!-- Show what to bring -->
        <tr
          v-if="bringTrue"
        >
          <td colspan="3">
            <v-container>
              <v-row>
                <!-- If we have keys needed, set up the grid for that -->
                <v-col 
                  v-if="bringKeys.length > 0"
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
                  v-if="Object.keys(bringItems).length != 0"
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
            </v-container>
          </td>
        </tr>
        <!-- Show the map specific quests -->
        <quest-row
          v-for="quest in sortHere"
          :key="quest.id"
          :quest-details="quest"
          page-type="available"
          @questStateChanged="refreshQuests()"
        />
        <!-- Globally available quests header -->
        <tr
          v-if="sortAnywhere.length != 0"
          style="text-align:center;"
        >
          <td
            colspan="3"
            class="success"
          >
            <h5
              class="title"
              style="color: #fff"
            >
              <v-icon style="color:#fff">
                public
              </v-icon>Globally available quests
            </h5>
          </td>
        </tr>
        <!-- Show global quests -->
        <quest-row
          v-for="quest in sortAnywhere"
          :key="quest.id"
          :quest-details="quest"
          page-type="available"
          @questStateChanged="refreshQuests()"
        />
      </tbody>
    </v-simple-table>
  </div>
</template>

<script>
  export default {
    name: 'MapTabsTable',
    components: {
      QuestRow: () => import('../components/QuestRow.vue'),
    },
    props: {
      mapName: {
        type: String,
      },
    },
    data () {
      return {
      }
    },
    metaInfo: {
      // Children can override the title.
      title: 'Maps',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plan your raid, seeing available quests by map, as well as items, keys, and friends you need to bring with you.' },
      ],
    },
    computed: {
      bringItems: function () {
        var allItems = this.sortHere
          .filter(w => w.myAvailability == 0) // Only include quests that we're on, not teammates
          .reduce((acc, x) => acc.concat(x.objectives), []) // Get a flat list of objectives
          .reduce((items, item) => items.find(x => x.id === item.id) ? [...items] : [...items, item], []) // Filter out duplicate objective IDs in the case of things like Chemical Pt 4
          .filter(y => ['place', 'mark'].indexOf(y.type) >= 0) // Filter them down to things that need items
          .filter(z => z.completed == false) // Only include the item if the objective is incomplete

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
        return this.sortHere
          .reduce((acc, x) => acc.concat(x.objectives), []) // Get a flat list of objectives
          .filter(y => ['key'].indexOf(y.type) >= 0) // Filter them down to key requirements
      },
      bringTrue: function () {
        return (Object.keys(this.bringItems).length != 0 || this.bringKeys.length > 0)
      },
      sortAnywhere: function () {
        return this.available_quests.slice().filter(x => this.isQuestAnywhere(x) === true).sort((a, b) => (this.calculateLocked(a) < this.calculateLocked(b)) ? 1 : -1)
      },
      sortHere: function () {
        return this.available_quests.slice().filter(x => this.isQuestAnywhere(x) !== true).sort((a, b) => (this.calculateLocked(a) < this.calculateLocked(b)) ? 1 : -1)
      },
      combinedQuests: function () {
        return this.sortHere.concat(this.sortAnywhere)
      },
      available_quests: function () {
        var available_quests = []
        var useTeammates = this.$store.copy('user/useTeammates') || false
        var extraTeammates = Object.values(this.$root.team).slice(1)
        var questProgress = this.$store
        // Get the default quest list by value instead of reference
        var tempQuests = this.$root.questArrayCopy()
        if (extraTeammates == null || extraTeammates.length < 1) {
          useTeammates = false
        }
        questLoop:
          for (var i = 0; i < tempQuests.length; i++) {
            var currentQuest = Object.create(tempQuests[i])
            if (currentQuest.deprecated == true) {
              // Don't show this quest - its deprecated
              continue questLoop
            }

            // Get and keep my availability for future use
            var myAvailability = this.myselfQuestAvailable(currentQuest)
            // Get truthiness of whether we should use this map
            var available = (myAvailability == 0)
            // Check if the quest has objectives on this map, and if so return a filtered version
            var isMapMatch = this.isQuestOnMap(currentQuest, this.mapName)
            if (isMapMatch != false) {
              // Use the filtered version of the quest for this map
              currentQuest = isMapMatch
            } else {
              // The quest isn't available for this map, save time and continue
              continue questLoop
            }

            // Initialize availability array with yourself
            var availability = [{
              identity: this.$root.teammates[0],
              status: myAvailability >= 0 ? myAvailability : 0 - this.myselfCalculateUnlocked(currentQuest),
            }]
            // If we are using teammates, and have teammates
            if (useTeammates && extraTeammates.length > 0) {
              // Loop through our teammates to check each one
              for (var x = extraTeammates.length - 1; x >= 0; x--) {
                // Check if any of the teammates need this quest
                var theirAvailability = this.isQuestAvailable(currentQuest, extraTeammates[x].store)
                availability.push({
                  identity: extraTeammates[x],
                  status: theirAvailability >= 0 ? theirAvailability : 0 - this.calculateUnlocked(currentQuest, extraTeammates[x].store),
                })
                if (theirAvailability == 0) {
                  // This teammate has this quest available, mark the quest as available
                  available = true
                }
              }
            }

            // If the quest is on map & available to someone
            if (available == true && isMapMatch != false) {
              // Pass the availability array to the questDetails object
              currentQuest.availability = availability

              // Pass availability as helper for figuring out things to bring
              currentQuest.myAvailability = this.myselfQuestAvailable(currentQuest)
              for (var z = currentQuest.objectives.length - 1; z >= 0; z--) {
                currentQuest.objectives[z].completed = this.$store.copy('progress/objective_complete', currentQuest.objectives[z].id)
              }
              available_quests.push(currentQuest)
            }
          }
        return available_quests
      },
    },
    mounted () {
    },
    methods: {
    },
  }
</script>
