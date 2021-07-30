import Vue from 'vue'
import makeTeamStore from './store/teamstore.js'

// Global TarkovTracker Vue Mixin
export default {
  computed: {
    questArray: function() {
      return this.questDataDefault
        .filter(x => x.deprecated !== true)
    },
    questDictionary: function() {
      return this.questDataDefault.reduce((a, x) => ({ ...a, [x.title]: x }), {})
    },
    questDictionaryId: function() {
      return this.questDataDefault.reduce((a, x) => ({ ...a, [x.id]: x }), {})
    },
    objectiveArray: function() {
      return this.questDataDefault
        .filter(x => x.deprecated !== true)
        .reduce((acc, x) => acc.concat(x.objectives), []) // Get a flat list of objectives
    },
    objectiveDictionary: function() {
      return this.objectiveArray
        .reduce((a, x) => ({ ...a, [x.id]: x }), {}) // Reduce to a mapping of ID to objective
    },
    objectiveDictionaryQuests: function() {
      var objectives = Object.values(this.objectiveDictionary)
      objectives.forEach((objective) => {
        objective.quests = this.questArray
          .filter(quest => quest.objectives.includes(objective))
          .reduce((acc, x) => acc.concat(x.id), [])
      }, this)
      return objectives.reduce((a, x) => ({ ...a, [x.id]: x }), {})
    },
    hideoutObjectiveArray: function() {
      return this.hideoutDataDefault.modules
        .reduce((acc, x) => acc.concat(x.require), []) // Get a flat list of objectives
    },
    hideoutObjectiveDictionary: function() {
      return this.hideoutObjectiveArray
        .reduce((a, x) => ({ ...a, [x.id]: x }), {}) // Reduce to a mapping of ID to objective
    },
    hideoutStationDictionary: function() {
      return this.hideoutDataDefault.stations
        .reduce((a, x) => ({ ...a, [x.id]: x }), {}) // Reduce to a mapping of ID to station
    },
    itemDictionary: function() {
      return this.itemDataDefault // Return the existing dictionary of items from tarkovdata
    },
    traderDictionary: function() {
      return Object.values(this.traderDataDefault)
        .reduce((a, x) => ({ ...a, [x.id]: x }), {}) // Reduce to a mapping of id to trader
    },
    mapArray: function() {
      return Object.values(this.mapDataDefault)
    },
    mapDictionary: function() {
      return Object.values(this.mapDataDefault)
        .reduce((a, x) => ({ ...a, [x.id]: x }), {}) // Reduce to a mapping of id to map
    },
    me: function() {
      return {
        store: this.$store,
        id: this.$store.copy('app/get_user_auth_uid') || 'self',
        dynamic: (this.$store.copy('firesys') != null && this.$store.copy('firesys/team') != null) || false,
        self: true,
        version: {
          major: this.$root.$data.overallVersion,
          data: this.$root.$data.dataHash,
        },
      }
    },
    staticTeammates: function() {
      var teammates = []
      var staticTeammates = this.$store.copy('user/get_static_teammates')

      if (this.$store.copy('user/useTeammates')) {
        staticTeammates.forEach((teammate, i) => {
          var staticTeammate = teammate
          staticTeammate.dynamic = false
          staticTeammate.store = makeTeamStore()
          staticTeammate.store.set('progress/import_teamshare!', staticTeammate.teamshare)
          teammates.push(staticTeammate)
        })
      }

      return teammates
    },
    liveTeammates: function() {
      var teammates = []
      if (this.$store.copy('app/get_user_auth_uid')) {
        var fireSys = this.$store.copy('firesys')
        if (fireSys && fireSys.team && fireSys.team.members) {
          var hideTeammates = this.$store.copy('user/get_hidden_teammates')
          fireSys.team.members.forEach((userId) => {
            if (userId != this.$store.copy('app/get_user_auth_uid')) {
              var dynamicTeammate = {
                dynamic: true,
                id: userId,
                store: makeTeamStore(),
                exportTime: Date.now(),
                hide: hideTeammates ? hideTeammates.includes(userId) : false,
                version: {
                  major: this.$root.$data.overallVersion,
                  data: this.$root.$data.dataHash,
                },
              }
              dynamicTeammate.store.set('bindProgress!', userId)
              teammates.push(dynamicTeammate)
            }
          })
        }
      }
      return teammates
    },
    teammates: function() {
      return [...this.liveTeammates, ...this.staticTeammates]
    },
    team: function() {
      return [this.me, ...this.teammates]
    },
    teamAvailability: function() {
      var teamAvailability = {}
      // Creats a matrix of quest availability for you and the members of your team
      this.team.forEach((member, teamIndex) => {
        teamAvailability[teamIndex] = {}
        this.questArray.forEach((quest) => {
          teamAvailability[teamIndex][quest.id] = this.isQuestAvailable(quest, member.store)
        }, this)
      }, this)
      return teamAvailability
    },
    questAvailability: function() {
      // Creats a matrix of quest availability for you and the members of your team
      var questAvailability = {}
      this.questArray.forEach((quest) => {
        questAvailability[quest.id] = {}
        this.team.forEach((member, teamIndex) => {
          // If were not a hidden teammate, and were not a teammate with teammates off
          if (!member.hide && !(!member.self && this.$store.copy('user/useTeammates') == false)) {
            questAvailability[quest.id][teamIndex] = this.isQuestAvailable(quest, member.store)
          }
        }, this)
      }, this)

      return questAvailability
    },
    levelAvailability: function() {
      // Creats a matrix of level availability for you and the members of your team
      var levelAvailability = {}
      this.questArray.forEach((quest) => {
        levelAvailability[quest.id] = {}
        this.team.forEach((member, teamIndex) => {
          // If were not a hidden teammate, and were not a teammate with teammates off
          levelAvailability[quest.id][teamIndex] = (member.store.copy('progress/level') || 71) >= quest.require.level ? true : false
        }, this)
      }, this)
      return levelAvailability
    },
    objectiveAvailability: function() {
      // Creats a matrix of objective availability for you and the members of your team
      var objectiveAvailability = {}
      this.objectiveArray.forEach((objective) => {
        objectiveAvailability[objective.id] = {}
        this.team.forEach((member, teamIndex) => {
          // If were not a hidden teammate, and were not a teammate with teammates off
          if (!member.hide && !(!member.self && this.$store.copy('user/useTeammates') == false)) {
            objectiveAvailability[objective.id][teamIndex] = member.store.copy('progress/objective_complete', objective.id)
          }
        }, this)
      }, this)

      return objectiveAvailability
    },
    questsByMap: function () {
      var mapSet = {}
      var maps = this.mapArray.reduce((acc, x) => acc.concat(x.id), [])
      maps.forEach((map) => {
        mapSet[map] = new Set()
        this.questArrayCopy().forEach((quest) => {
          if(this.isQuestOnMap(quest, map)) {
            mapSet[map].add(quest.id)
          }
        }, this)
      }, this)
      return mapSet
    },
    mapAvailability: function () {
      var mapAvailability = {}
      Object.keys(this.questsByMap).forEach((map) => {
        mapAvailability[map] = 0
        this.questsByMap[map].forEach((questId) => {
          if (Object.values(this.questAvailability[questId]).some(availability => availability === 0)
            && this.isQuestMapSpecific(this.questDictionaryId[questId], map)) {
            mapAvailability[map] += 1
          }
        }, this)
      }, this)

      mapAvailability['global'] = 0
      this.questArrayCopy().forEach((quest) => {
        if (Object.values(this.questAvailability[quest.id]).some(person => person == 0) && this.isQuestOnMap(quest) != false && !this.isQuestMapSpecific(quest)) {
          mapAvailability['global'] += 1
        }
      }, this)
      return mapAvailability
    },
    hideoutNeeded: function() {
      var hideoutNeeded = {}
      this.hideoutDataDefault.modules.forEach((hModule) => {
          hModule.require.forEach((requirement) => {
            hideoutNeeded[requirement.id] = {}
            	this.team.forEach((member, teamIndex) => {
                // If our own objectives, or a dynamic teammate that isn't hidden and showing team is on
            		if ((member.self || member.dynamic) && !(!member.self && this.$store.copy('user/useTeammates') == false)) {
            			hideoutNeeded[requirement.id][teamIndex] = (member.store.copy('progress/hideout_objective_complete', requirement.id) == false)
            		}
		        }, this)
          }, this)
      }, this)
      return hideoutNeeded
    },
    hideoutItems: function () {
        var hideoutItems = []
        // For each hideout module
        this.hideoutDataDefault.modules.forEach((hModule) => {
            // For each requirement in each module
            hModule.require.forEach((requirement) => {
              // If the requirement type is an item, and anyone needs it
              if (requirement.type == 'item' && this.hideoutNeeded[requirement.id][0] == true) {
                hideoutItems.push({
                    itemId: requirement.name,
                    have: this.$store.get('progress/hideout_objective_have', requirement.id),
                    number: requirement.quantity,
                    for: hModule,
                    forLevel: hModule.level,
                    objective: requirement.id,
                    type: 'hideout',
                })
              }
            }, this)
        }, this)
        return hideoutItems
    },
    questItems: function () {
    	var questItems = []
    	this.questArray.forEach((quest) => {
    		quest.objectives.forEach((objective) => {
    			if (['find', 'collect', 'hideout'].indexOf(objective.type) >= 0 && Object.values(this.objectiveAvailability[objective.id]).some(completed => completed == false)) {
    				var teamHave = {}
    				Object.values(this.objectiveAvailability[objective.id]).forEach((completed, teamIndex) => {
    					if (!completed && teamIndex != 0 && this.team[teamIndex].store.get('progress/objective_have', objective.id) < objective.number) {
    						teamHave[teamIndex] = this.team[teamIndex].store.get('progress/objective_have', objective.id)
    					}
    				}, this)
    				questItems.push(
	                {
                    itemId: objective.target,
	                  have: this.$store.get('progress/objective_have', objective.id),
	                  teamHave: teamHave,
	                  number: objective.number,
	                  for: quest.giver,
	                  quest: quest,
	                  objective: objective.id,
	                  fir: (objective.type == 'find'),
	                  unlocked: this.calculateUnlocked(quest, this.$store),
	                  type: 'quest',
	                  nokappa: quest.nokappa,
	                })
    			}
    		}, this)
    	}, this)
    	return questItems
    },
  },
}
