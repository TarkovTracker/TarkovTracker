<template>
    <v-container
      id="dashboard-view"
      fluid
      tag="section"
    >
      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col
              cols="12"
            >
              <material-chart-card
                :data="traderChartData"
                :options="traderChartOptions"
                :responsive-options="chartsResponsiveOptions"
                type="Bar"
                title="Quest completion by trader"
                subtitle="White = Uncompleted, Blue = Completed"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col
              cols="12"
            >
              <material-chart-card
                :data="mapChartData"
                :options="mapChartOptions"
                :responsive-options="chartsResponsiveOptions"
                type="Bar"
                title="Objective completion by map"
                subtitle="White = Uncompleted, Blue = Completed"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row
        class="mt-5"
      >
        <v-col
          v-for="(trader, i) in loyaltyLevelStats"
          :key="i"
          cols="auto"
          class="ml-auto mr-auto"
        >
          <loyalty-stat-card 
            :traderId="trader.trader" 
            :loyaltyLevel="trader.loyaltyLevel" 
            :reputation="trader.reputation" 
            :nextLoyaltyRep="trader.nextLoyaltyRep" 
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="({ actionIcon, actionText, ...attrs }, i) in completionStats"
          :key="i"
          cols="12"
          md="6"
          lg="3"
        >
          <material-stat-card v-bind="attrs">
            <template #actions>
              <v-icon
                class="mr-2"
                small
                v-text="actionIcon"
              />
              <div class="text-truncate">
                {{ actionText }}
              </div>
            </template>
          </material-stat-card>
        </v-col>
      </v-row>
      <v-row
        align="center"
        justify="center"
        class="mt-5"
      >
        <div>
          <v-btn
            elevation="2"
            large
            href="https://discord.gg/zeAP4Ng"
            target="_blank"
            color="#5865F2"
            class="mx-2"
          >
            <v-icon
              dark
              class="mr-2"
            >
              mdi-discord
            </v-icon>
            Join Discord
          </v-btn>
          <v-btn
            elevation="2"
            large
            href="https://www.patreon.com/bePatron?u=13444262"
            target="_blank"
            color="#FF424D"
            class="mx-2"
          >
            <v-icon
              dark
              class="mr-2"
            >
              mdi-patreon
            </v-icon>
            Support TarkovTracker
          </v-btn>
          <v-btn
            elevation="2"
            large
            href="https://github.com/TarkovTracker/TarkovTracker"
            target="_blank"
            color="#FFFFF"
            class="mx-2"
          >
            <v-icon
              dark
              class="mr-2"
            >
              mdi-github
            </v-icon>
            Contribute Code
          </v-btn>
        </div>
      </v-row>
    </v-container>
</template>

<script>
  // Utilities
  import { get } from 'vuex-pathify'
  import Vue from 'vue'

  const lineSmooth = Vue.chartist.Interpolation.cardinal({
    tension: 0,
  })

  export default {
    name: 'DashboardView',
    data: () => ({
      traderChartOptions: {
        stackBars: true,
        low: 0,
        high: 40,
        chartPadding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      mapChartOptions: {
        stackBars: true,
        low: 0,
        high: 80,
        chartPadding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      chartsResponsiveOptions: [
        ['screen and (min-width: 801px) and (max-width: 1024px)', {
          showPoint: false,
          axisX: {
            labelInterpolationFnc: function (value) {
              // Will return Mon, Tue, Wed etc. on medium screens
              return value.slice(0, 3)
            },
          },
        }],
        ['screen and (max-width: 800px)', {
          showLine: false,
          axisX: {
            labelInterpolationFnc: function (value) {
              // Will return M, T, W etc. on small screens
              return value[0]
            },
          },
        }],
      ],
    }),
    computed: {
      completionStats () {
        var questProgress = this.$store.get('progress/quests_array')
        var objectiveProgress = this.$store.get('progress/objectives_array')
        var totalQuests = this.questDataDefault.filter(x => x.deprecated !== true).length
        var completedQuests = this.questDataDefault.filter((x, y) => this.$store.get('progress/quest_complete', x.id) == true && x.deprecated !== true).length

        // Quest completion
        var totalKappaQuests = this.questDataDefault.filter(x => x.deprecated !== true && x.nokappa !== true).length - 1
        var completedKappaQuests = (this.questDataDefault.filter((x, y) => this.$store.get('progress/quest_complete', x.id) == true && x.deprecated !== true && x.nokappa !== true).length || 0)

        // PMC eliminations
        var totalPMCEliminations = this.$root.objectiveArray.filter(x => x.type.toLowerCase() === 'kill' && x.target.toLowerCase() === 'pmcs').reduce((acc, x) => acc + x.number, 0)
        var completePMCEliminations = (this.$root.objectiveArray.filter(x => x.type.toLowerCase() === 'kill' && x.target.toLowerCase() === 'pmcs').reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

        // Scav eliminations
        var totalScavEliminations = this.$root.objectiveArray.filter(x => x.type.toLowerCase() === 'kill' && x.target.toLowerCase() === 'scavs').reduce((acc, x) => acc + x.number, 0)
        var completeScavEliminations = (this.$root.objectiveArray.filter(x => x.type.toLowerCase() === 'kill' && x.target.toLowerCase() === 'scavs').reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

        // Quest items
        var totalQuestItems = this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'find' || x.type.toLowerCase() === 'collect') && !['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(x.target.toLowerCase())).reduce((acc, x) => acc + x.number, 0)
        var completeQuestItems = (this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'find' || x.type.toLowerCase() === 'collect') && !['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(x.target.toLowerCase())).reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

        // FIR Items
        var totalFIRItems = this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'find') && !['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(x.target.toLowerCase())).reduce((acc, x) => acc + x.number, 0)
        var completeFIRItems = (this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'find') && !['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(x.target.toLowerCase())).reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

        // Handover Items
        var totalHandoverItems = this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'collect') && !['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(x.target.toLowerCase())).reduce((acc, x) => acc + x.number, 0)
        var completeHandoverItems = (this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'collect') && !['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(x.target.toLowerCase())).reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

        // Placed items
        var totalPlacedItems = this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'place' || x.type.toLowerCase() === 'mark')).reduce((acc, x) => acc + x.number, 0)
        var completePlacedItems = (this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'place' || x.type.toLowerCase() === 'mark')).reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

        // Pickup items
        var totalPickupItems = this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'pickup')).reduce((acc, x) => acc + x.number, 0)
        var completePickupItems = (this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'pickup')).reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

        // Quest EXP gained
        var completeExpGained = this.$root.questArray.reduce((acc, x) => (this.$store.get('progress/quest_complete', x.id) ? acc + x.exp : acc), 0)

        var questTimeline = this.$root.questArray.map(x => new Object({ ...x, timeComplete: this.$store.get('progress/quest_time_complete', x.id) }))

        var firstQuestComplete = Math.min(...questTimeline.map(x => x.timeComplete).filter(x => x != null))

        var timelineQuestsComplete = questTimeline.filter(x => x.timeComplete != null).length

        var questsPerDay = Math.ceil(timelineQuestsComplete / Math.ceil((Date.now() - firstQuestComplete) / 86400000))

        var daysSinceFirstQuest = Math.ceil((Date.now() - firstQuestComplete) / 86400000)

        var objectiveTimeline = this.$root.objectiveArray.map(x => new Object({ ...x, timeComplete: this.$store.get('progress/objective_time_complete', x.id) }))

        var firstObjectiveComplete = Math.min(...objectiveTimeline.map(x => x.timeComplete).filter(x => x != null))

        var timelineObjectivesComplete = objectiveTimeline.filter(x => x.timeComplete != null).length

        var objectivesPerDay = Math.ceil(timelineObjectivesComplete / Math.ceil((Date.now() - firstObjectiveComplete) / 86400000))

        let cardsData = [
          {
            actionIcon: 'mdi-help-circle',
            actionText: `${completedKappaQuests}/${totalKappaQuests} Kappa`,
            color: 'var(--v-accent-base)',
            icon: 'mdi-check-all',
            title: 'Completed Quests',
            value: `${completedQuests}/${totalQuests}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'Including special kill requirements',
            color: 'var(--v-accent-base)',
            icon: 'mdi-target-account',
            title: 'PMC Eliminations',
            value: `${completePMCEliminations}/${totalPMCEliminations}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'Including special kill requirements',
            color: 'var(--v-accent-base)',
            icon: 'mdi-target-account',
            title: 'Scav Eliminations',
            value: `${completeScavEliminations}/${totalScavEliminations}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'Includes FIR and non-FIR collection items',
            color: 'var(--v-accent-base)',
            icon: 'mdi-briefcase-search',
            title: 'Quest Items',
            value: `${completeQuestItems}/${totalQuestItems}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'Excludes items that can be bought from Flea or Vendors',
            color: 'var(--v-accent-base)',
            icon: 'mdi-checkbox-marked-circle-outline',
            title: 'Found In Raid Items',
            value: `${completeFIRItems}/${totalFIRItems}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'Excludes items that need to be found in raid',
            color: 'var(--v-accent-base)',
            icon: 'mdi-close-circle-outline',
            title: 'Handover Items',
            value: `${completeHandoverItems}/${totalHandoverItems}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'Markers, cameras, tools, and other items that are placed in a map',
            color: 'var(--v-accent-base)',
            icon: 'mdi-arrow-down-drop-circle-outline',
            title: 'Placed Objectives',
            value: `${completePlacedItems}/${totalPlacedItems}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'Items such as docs cases or briefcases that are picked up',
            color: 'var(--v-accent-base)',
            icon: 'mdi-arrow-up-drop-circle-outline',
            title: 'Pickup Objectives',
            value: `${completePickupItems}/${totalPickupItems}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'EXP Rewarded from quest completions',
            color: 'var(--v-accent-base)',
            icon: 'mdi-star-half-full',
            title: 'Quest EXP',
            value: `${completeExpGained.toLocaleString()}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'May be inaccurate until next wipe',
            color: 'var(--v-accent-base)',
            icon: 'mdi-calendar-check',
            title: 'Days Since First Quest',
            value: `${daysSinceFirstQuest}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'May be inaccurate until next wipe',
            color: 'var(--v-accent-base)',
            icon: 'mdi-timer',
            title: 'Quests Per Day',
            value: `${questsPerDay}`,
          },
          {
            actionIcon: 'mdi-help-circle',
            actionText: 'May be inaccurate until next wipe',
            color: 'var(--v-accent-base)',
            icon: 'mdi-timer',
            title: 'Objectives Per Day',
            value: `${objectivesPerDay}`,
          },
        ];

        return cardsData
      },
      loyaltyLevelStats () {
        const START_REPUTATION = this.$store.get('progress/gameEdition') >= 3 ? 0.2 : 0;

        // All traders except Fence
        var relevantTraders = Object.values(this.traderDataDefault).filter(trader => trader.id != 7)

        var reputations = {}
        relevantTraders.forEach(trader => {
          reputations[trader.id] = {value: START_REPUTATION, level: 1, toNextLevel: 0}
        }, this);

        this.$root.questArray.forEach(quest => {
          if ('reputationFailure' in quest && this.$store.copy('progress/quest_failed', quest.id) == true) {
            quest.reputationFailure.forEach(reputation => {
              let trader = reputation.trader;
              reputations[trader].value += reputation.rep;
            }, this);
          } else if ('reputation' in quest && this.$store.copy('progress/quest_complete', quest.id) == true) {
            quest.reputation.forEach(reputation => {
              let trader = reputation.trader;
              reputations[trader].value += reputation.rep;
            }, this);
          }
        }, this);

        for (let [trader, reputation] of Object.entries(reputations)) {
          let currentTrader = this.$root.traderDictionary[trader];
          for (let i = 0; i < currentTrader.loyalty.length; i++) {
            // If we are looking at last possible level and player has more than the required reputation for that level
            if (i === currentTrader.loyalty.length - 1 && currentTrader.loyalty[i].requiredReputation <= reputation.value) {
              reputation.level = currentTrader.loyalty[i].level
            // If player has enough reputation for the given level, but not more than what is required for the next level
            } else if (currentTrader.loyalty[i].requiredReputation <= reputation.value && currentTrader.loyalty[i + 1].requiredReputation > reputation.value) {
              reputation.level = currentTrader.loyalty[i].level
              break;
            }
          }
        }

        for (let [trader, reputation] of Object.entries(reputations)) {
          let currentTrader = this.$root.traderDictionary[trader];
          let maxLoyaltyLevel = currentTrader.loyalty[currentTrader.loyalty.length - 1].level;
          reputation.toNextLevel = reputation.level === maxLoyaltyLevel ? 0 : currentTrader.loyalty[reputation.level].requiredReputation - reputation.value
        }

        let traderCardData = [];
        for (let [trader, reputation] of Object.entries(reputations)) {
          traderCardData.push({
            trader: parseInt(trader),
            loyaltyLevel: reputation.level,
            reputation: reputations[trader].value,
            nextLoyaltyRep: reputation.toNextLevel
          })
        }

        return traderCardData
      },
      mapChartData () {
        var factoryObjectives = 0
        var customsObjectives = 0
        var woodsObjectives = 0
        var shorelineObjectives = 0
        var interchangeObjectives = 0
        var reserveObjectives = 0
        var labsObjectives = 0
        var factoryObjectivesComplete = 0
        var customsObjectivesComplete = 0
        var woodsObjectivesComplete = 0
        var shorelineObjectivesComplete = 0
        var interchangeObjectivesComplete = 0
        var reserveObjectivesComplete = 0
        var labsObjectivesComplete = 0
        var tempQuests = this.questDataDefault
        var i
        for (i = 0; i < tempQuests.length; i++) {
          for (var x = tempQuests[i].objectives.length - 1; x >= 0; x--) {
            switch (tempQuests[i].objectives[x].location.toLowerCase()) {
              case 'factory':
                factoryObjectives++
                if (this.$store.get('progress/objective_complete', tempQuests[i].objectives[x].id) == true) factoryObjectivesComplete++
                break
              case 'customs':
                customsObjectives++
                if (this.$store.get('progress/objective_complete', tempQuests[i].objectives[x].id) == true) customsObjectivesComplete++
                break
              case 'woods':
                woodsObjectives++
                if (this.$store.get('progress/objective_complete', tempQuests[i].objectives[x].id) == true) woodsObjectivesComplete++
                break
              case 'shoreline':
                shorelineObjectives++
                if (this.$store.get('progress/objective_complete', tempQuests[i].objectives[x].id) == true) shorelineObjectivesComplete++
                break
              case 'interchange':
                interchangeObjectives++
                if (this.$store.get('progress/objective_complete', tempQuests[i].objectives[x].id) == true) interchangeObjectivesComplete++
                break
              case 'reserve':
                reserveObjectives++
                if (this.$store.get('progress/objective_complete', tempQuests[i].objectives[x].id) == true) reserveObjectivesComplete++
                break
              case 'labs':
                labsObjectives++
                if (this.$store.get('progress/objective_complete', tempQuests[i].objectives[x].id) == true) labsObjectivesComplete++
                break
            }
          }
        }

        var chartData = {
          labels: ['Factory', 'Customs', 'Woods', 'Shoreline', 'Interchange', 'Reserve', 'Labs'],
          series: [
            [
              factoryObjectivesComplete,
              customsObjectivesComplete,
              woodsObjectivesComplete,
              shorelineObjectivesComplete,
              interchangeObjectivesComplete,
              reserveObjectivesComplete,
              labsObjectivesComplete,
            ],
            [
              factoryObjectives - factoryObjectivesComplete,
              customsObjectives - customsObjectivesComplete,
              woodsObjectives - woodsObjectivesComplete,
              shorelineObjectives - shorelineObjectivesComplete,
              interchangeObjectives - interchangeObjectivesComplete,
              reserveObjectives - reserveObjectivesComplete,
              labsObjectives - labsObjectivesComplete,
            ],
          ],
        }

        return chartData
      },
      traderChartData () {
        var labels = []
        var seriesComplete = []
        var seriesTotal = []
        // Loop through each trader
        Object.values(this.$root.traderDataDefault).forEach((trader) => {
          var traderTotal = 0
          var traderComplete = 0
          // Check all the relevant quests
          this.$root.questArray.filter(quest => quest.giver == trader.id).forEach((quest) => {
            traderTotal++
            if (this.$store.get('progress/quest_complete', quest.id) === true) {
              traderComplete++
            }
          }, this)
          // Add this traders data to the chart arrays
          labels.push(trader.locale.en)
          seriesComplete.push(traderComplete)
          seriesTotal.push(traderTotal - traderComplete)
        }, this)

        var chartData = {
          labels: labels,
          series: [seriesComplete, seriesTotal],
        }

        return chartData
      },
      traderReputationData () {
        const EOD_START_REP = 0.2;
        let reputations = {
          'Prapor': 0,
          'Therapist': 0,
          'Skier': 0,
          'Peacekeeper': 0,
          'Mechanic': 0,
          'Ragman': 0,
          'Jaeger': 0,
        };
        for (let i = 0; i < this.questDataDefault.length; i++) {
          let quest = this.questDataDefault[i];
          if (this.$store.get('progress/quest_complete', quest.id) == true) {
            for (var j = 0; j < quest.reputation.length; j++) {
              let trader = quest.reputation[j].trader;
              reputations[trader] += quest.reputation[j].rep;
            }
          }
        }
        var chartData = {
          labels: Object.keys(reputations),
          series: [
            Object.values(reputations).map(value => {return value + EOD_START_REP}),
            Object.values(reputations),
          ],
        }
        return chartData;
      }
    },
    methods: {
    },
  }
</script>
<style lang="sass">
//.ct-series-a .ct-bar
//  stroke: #4caf50 !important
//
//.ct-series-b .ct-bar
//  stroke: #FFFFFF !important

</style>
