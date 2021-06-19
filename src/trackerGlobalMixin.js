import questData from '../tarkovdata/quests.json'
import hideoutData from '../tarkovdata/hideout.json'

export default {
  data() {
    return {
      questDataDefault: questData, // Imports the quest data from questData.json
      hideoutDataDefault: hideoutData, // Imports the hideout data from hideoutData.json
    }
  },
  methods: {
    questArrayCopy() {
      var stringCopy = JSON.stringify(this.questDataDefault
        .filter(x => x.deprecated !== true))

      var returnCopy = JSON.parse(stringCopy)
      return returnCopy
    },
    // Return a string which is a list of related quest maps
    calculateLocation(quest) {
      var locations = []
      for (var i = quest.objectives.length - 1; i >= 0; i--) {
        if (quest.objectives[i].location.toLowerCase() !== 'Any') {
          locations.push(quest.objectives[i].location)
        }
      }
      locations.splice(0, locations.length, ...(new Set(locations)))
      return locations.join(', ')
    },
    // Return a string which is a list of alternative quests
    calculateAlternatives(quest) {
      var alternatives = [quest.title]
      for (var i = quest.alternatives.length - 1; i >= 0; i--) {
        alternatives.push(this.$root.questDictionaryId[quest.alternatives[i]].title)
      }
      return alternatives
    },
    // Check if you have enough completion for an objective
    objectiveHaveEnough(objective) {
      if ('number' in objective) {
        if (progressStore.copy('progress/objective_have', objective.id) >= objective.number) {
          return true
        }
      }
      return false
    },
    // Mark an entire quest as completed
    CompleteQuest(quest) {
      this.$store.set('progress/complete_quest', quest.id)
      // If there are any alternative quests, mark them as 'failed'
      if (quest.alternatives) {
        // For each alternative
        quest.alternatives.forEach((questId) => {
          this.$store.set('progress/fail_quest', questId)
        }, this)
      }
      for (var i = quest.objectives.length - 1; i >= 0; i--) {
        this.$store.set('progress/complete_objective', quest.objectives[i].id)
        // Mark any items as found all if collect or find
        // if (['collect', 'find'].indexOf(quest.objectives[i].type) >= 0) {
        //   questProgress.objectives[quest.objectives[i].id].have = quest.objectives[i].number
        // }
      }

      this.$analytics.logEvent('quest_complete', {
        event_category: 'Progression',
        event_label: `Completed ${quest.id}`,
        quests_previously: this.$store.copy('progress/quests_array').filter(x => x.complete).length,
        quest_id: quest.id,
      })
      this.$analytics.setUserProperties({
        quests_complete: this.$store.copy('progress/quests_array').filter(x => x.complete).length,
      })
    },
    // Toggle completion of a specific quest objective
    ToggleObjective(objective) {
      if (!this.$store.copy('progress/objective_complete', objective.id)) {
        this.$store.set('progress/complete_objective', objective.id)
      } else {
        this.$store.set('progress/uncomplete_objective', objective.id)
      }

      this.$analytics.logEvent('objective_complete', {
        event_category: 'Progression',
        event_label: `Completed ${objective.id}`,
        quests_previously: this.$store.copy('progress/quests_array').filter(x => x.complete).length - 1,
        objective_id: objective.id,
      })
    },
    QuestUncomplete(quest) {
      this.$store.set('progress/uncomplete_quest', quest.id)

      this.$analytics.logEvent('quest_uncomplete', {
        event_category: 'Progression',
        event_label: `Uncompleted ${quest.id}`,
        quests_previously: this.$store.copy('progress/quests_array').filter(x => x.complete).length + 1,
        quest_id: quest.id,
      })
      this.$analytics.setUserProperties({
        quests_complete: this.$store.copy('progress/quests_array').filter(x => x.complete).length,
      })
    },
    // Complete all pre-requisities and skip to quest
    QuestSkip(quest) {
      var beforeCount = this.$store.copy('progress/quests_array').filter(x => x.complete).length

      var unlockedList = this.calculateUnlockedList(quest, this.$store)

      for (var i = unlockedList.length - 1; i >= 0; i--) {
        this.CompleteQuest(unlockedList[i])
      }

      this.$analytics.logEvent('quest_skip', {
        event_category: 'Progression',
        event_label: `Skipped to ${quest.id}`,
        quests_previously: beforeCount,
        quests_skipped: this.$store.copy('progress/quests_array').filter(x => x.complete).length - beforeCount,
        quest_id: quest.id,
      })
    },
    // Calculate the number of quests locked behind this quest (excluding Collector)
    calculateLocked(quest) {
      return this.calculateLockedList(quest).length
    },

    // Calculate the quests locked behind this quest (excluding Collector by default)
    calculateLockedList(quest, ignoreSet = new Set([195])) {
      // Get the array of unique quests that are explicitly or optionally locked by this quest
      // By default, we exclude Collector, but can specify other quests to prune individual quests or entire chains
      var lockedQuestArray = this.calculateLockedListRecursive(quest.id, ignoreSet)

      return lockedQuestArray.map(x => this.$root.questDictionaryId[x])
    },

    // Get an array of unique quests that we are part of the tree of requirements for them
    calculateLockedListRecursive(lockQuestId, ignoreSet) {
      // Create our base set
      var baseLockSet = new Set()
      // Create our working set
      var workingLockSet = new Set()
      // Add the base quest Id to the set
      workingLockSet.add(lockQuestId)

      // Keep operating until the workingLockSet isn't growing
      do {
        // Set the base set each loop
        baseLockSet = new Set(workingLockSet)
        // For each quest, check against our baseSet
        this.$root.questArray.forEach((quest) => {
          // Check a flat array of all of the required quests in this quest
          if (quest.require.quests) {} else {
            return
          }
          quest.require.quests.flat().forEach((requiredQuestId) => {
            // If this id is in our ignoreSet, continue on
            if (ignoreSet.has(requiredQuestId)) {
              return
            }
            // If this quest requires one of our quests, add it to the set
            if (workingLockSet.has(requiredQuestId)) {
              workingLockSet.add(quest.id)
            }
          })
        })
      }
      while (baseLockSet.size != workingLockSet.size)

      // Now that we've figured out all the quests locked behind, remove ourself
      workingLockSet.delete(lockQuestId)
      // Return the set as an array
      return [...workingLockSet]
    },

    calculateUnlockedListRecursive(unlockQuestId) {
      var unlockSet = new Set()

      if (this.$root.questDictionaryId[unlockQuestId].require.quests) {
        // Get a set of ids of all of the required quests for this, add them together and send them up
        this.$root.questDictionaryId[unlockQuestId].require.quests.flat().forEach((requiredQuestId) => {
          unlockSet = new Set([...unlockSet, requiredQuestId, ...this.calculateUnlockedListRecursive(requiredQuestId)])
        }, this)
      }

      return [...unlockSet]
    },

    // Calculate the quests needed to be completed before this quest becomes available
    calculateUnlocked(quest, progressStore) {
      return this.calculateUnlockedList(quest, progressStore).length
    },

    // Calculate the quests needed to be completed before this quest becomes available
    calculateUnlockedList(quest, progressStore) {
      var unlockers = new Set(this.calculateUnlockedListRecursive(quest.id))

      unlockers.forEach((unlockQuestId) => {
        // If the quest is completed, its not an unlocker for us anymore
        if (progressStore.copy('progress/quest_complete', unlockQuestId) === true) {
          unlockers.delete(unlockQuestId)
        }
      })

      // Map the uncompleted unlockers to their respective quests and return
      return [...unlockers].map(x => this.questDataDefault[x])
    },

    myselfCalculateUnlocked(quest) {
      return this.calculateUnlocked(quest, this.$store)
    },
    // Return result of isQuestAvailable for our own progress
    myselfQuestAvailable(quest) {
      return this.isQuestAvailable(quest, this.$store)
    },
    // Figure out if the quest is available (0), locked (-1) or completed (1)
    isQuestAvailable(quest, progressStore) {
      // If the quest is already completed, then the quest is not available
      if (progressStore.copy('progress/quest_complete', quest.id)) {
        return 1
      }
      // Check each of the prerequisites to see if this quest is unlocked
      if (quest.require.quests) {
        // For each prerequisite
        for (var x = quest.require.quests.length - 1; x >= 0; x--) {
          var oneOf = false
          if (Array.isArray(quest.require.quests[x])) {
            for (var i = quest.require.quests[x].length - 1; i >= 0; i--) {
              if (progressStore.copy('progress/quest_complete', quest.require.quests[x][i]) === true) {
                oneOf = true
              }
            }

            if (!oneOf) {
              // We didn't complete one of the one-of array required quests
              return -1
            }
          }
          // If the prereq isn't completed, then we are locked
          if (!oneOf && !progressStore.copy('progress/quest_complete', quest.require.quests[x])) {
            return -1
          }
        }
      }
      // If we got here, we're available
      return 0
    },
    // Figure out if this quest's objectives aren't focused on a particular map or maps
    isQuestAnywhere(quest) {
      for (var i = quest.objectives.length - 1; i >= 0; i--) {
        // If we have a location and it isn't any, then we are targeted
        if ('location' in quest.objectives[i] && quest.objectives[i].location.toLowerCase() !== 'any') {
          return false
        }
      }
      // If we haven't found a non-anywhere location, we must be anywhere
      return true
    },
    // Check if a quest has objectives that can be completed on this map
    isQuestOnMap(quest, mapName) {
      var match = false
      if ('objectives' in quest && quest.objectives.length > 0) {
        for (var x = quest.objectives.length - 1; x >= 0; x--) {
          if (quest.objectives[x].location.toLowerCase() === mapName.toLowerCase()) {
            match = true
          } else if (quest.objectives[x].location.toLowerCase() === 'any' && ['skill', 'collect', 'find', 'reputation'].indexOf(quest.objectives[x].type.toLowerCase()) < 0) {
            match = true
          } else {
            quest.objectives.splice(x, 1)
          }
        }
      }
      if (match === true) {
        return quest
      } else {
        return false
      }
    },
    myselfObjectiveComplete(objective) {
      return this.isObjectiveComplete(objective, this.$store)
    },
    // Figure out if the objective is complete
    isObjectiveComplete(objective, progressStore) {
      // If the quest is already completed, then the quest is not available
      if (progressStore.copy('progress/objective_complete', objective.id)) {
        return 1
      }
      // If we got here, we're not complete
      return 0
    },
    myselfObjectiveEnough(objective) {
      return this.isObjectiveEnough(objective, this.$store)
    },
    // Figure out if the objective is complete
    isObjectiveEnough(objective, progressStore) {
      // If the quest is already completed, then the quest is not available
      if (progressStore.copy('progress/objective_have', objective.id) >= objective.number) {
        return 1
      }
      // If we got here, we're not complete
      return 0
    },
    traderIcon(name) {
      if (name === undefined || name === null) {
        return ''
      }
      switch (name.toLowerCase()) {
        case 'prapor':
          return '/img/PraporHeadshot.jpg'
        case 'therapist':
          return '/img/TherapistHeadshot.jpg'
        case 'skier':
          return '/img/SkierHeadshot.jpg'
        case 'peacekeeper':
          return '/img/PeacekeeperHeadshot.jpg'
        case 'mechanic':
          return '/img/MechanicHeadshot.jpg'
        case 'ragman':
          return '/img/RagmanHeadshot.jpg'
        case 'jaeger':
          return '/img/JaegerHeadshot.jpg'
        case 'fence':
          return '/img/FenceHeadshot.jpg'
      }
    },
    isModuleCompleted(moduleFind, levelFind) {
      var tempHideout = this.hideoutDataDefault.modules
      // Find the correct module first
      for (var z = tempHideout.length - 1; z >= 0; z--) {
        // Check the module name and level
        if (tempHideout[z].module == moduleFind && tempHideout[z].level == levelFind) {
          // Return the corrosponding completed field from progress via id
          return this.$store.copy('progress/hideout_complete', tempHideout[z].id)
        }
      }
      return false
    },
    generateTeamshareData() {
      var teamshareObject = {
        version: {
          major: this.$root.$data.overallVersion,
          data: this.$root.$data.dataHash,
        },
        exportTime: Date.now(),
        name: this.$store.copy('progress/shareName') || 'Yourself',
        teamshare: this.$store.copy('progress/export_teamshare'),
        totalComplete: this.$root.questArray.filter((x, y) => this.$store.copy('progress/quest_complete', x.id) == true && x.deprecated !== true).length,
      }
      return teamshareObject
    },
    removeStaticTeammate(teammateName) {
      if (this.$store.copy('user/get_static_teammate', teammateName).self != true) {
        this.$store.set('user/delete_teamshare', teammateName)
      }
    },
  },
}