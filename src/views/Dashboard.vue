<template>
  <keep-alive>
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
          <a
            href="https://www.patreon.com/bePatron?u=13444262"
            target="_blank"
          ><img src="https://c5.patreon.com/external/logo/become_a_patron_button.png"></a>
        </div>
      </v-row>
    </v-container>
  </keep-alive>
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
        var totalQuestItems = this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'find' || x.type.toLowerCase() === 'collect') && !['dollars', 'euros', 'roubles'].includes(x.target.toLowerCase())).reduce((acc, x) => acc + x.number, 0)
        var completeQuestItems = (this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'find' || x.type.toLowerCase() === 'collect') && !['dollars', 'euros', 'roubles'].includes(x.target.toLowerCase())).reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

        // FIR Items
        var totalFIRItems = this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'find') && !['dollars', 'euros', 'roubles'].includes(x.target.toLowerCase())).reduce((acc, x) => acc + x.number, 0)
        var completeFIRItems = (this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'find') && !['dollars', 'euros', 'roubles'].includes(x.target.toLowerCase())).reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

        // Handover Items
        var totalHandoverItems = this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'collect') && !['dollars', 'euros', 'roubles'].includes(x.target.toLowerCase())).reduce((acc, x) => acc + x.number, 0)
        var completeHandoverItems = (this.$root.objectiveArray.filter(x => (x.type.toLowerCase() === 'collect') && !['dollars', 'euros', 'roubles'].includes(x.target.toLowerCase())).reduce((acc, x) => this.$store.get('progress/objective_complete', x.id) ? acc + x.number : acc + this.$store.get('progress/objective_have', x.id), 0) || 0)

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

        return [
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
        ]
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
        var praporQuests = 0
        var praporComplete = 0
        var therapistQuests = 0
        var therapistComplete = 0
        var skierQuests = 0
        var skierComplete = 0
        var peacekeeperQuests = 0
        var peacekeeperComplete = 0
        var mechanicQuests = 0
        var mechanicComplete = 0
        var ragmanQuests = 0
        var ragmanComplete = 0
        var jaegerQuests = 0
        var jaegerComplete = 0
        var tempQuests = this.questDataDefault
        var i
        for (i = 0; i < tempQuests.length; i++) {
          switch (tempQuests[i].giver.toLowerCase()) {
            case 'prapor':
              praporQuests++
              if (this.$store.get('progress/quest_complete', tempQuests[i].id) == true) praporComplete++
              break
            case 'therapist':
              therapistQuests++
              if (this.$store.get('progress/quest_complete', tempQuests[i].id) == true) therapistComplete++
              break
            case 'skier':
              skierQuests++
              if (this.$store.get('progress/quest_complete', tempQuests[i].id) == true) skierComplete++
              break
            case 'peacekeeper':
              peacekeeperQuests++
              if (this.$store.get('progress/quest_complete', tempQuests[i].id) == true) peacekeeperComplete++
              break
            case 'mechanic':
              mechanicQuests++
              if (this.$store.get('progress/quest_complete', tempQuests[i].id) == true) mechanicComplete++
              break
            case 'ragman':
              ragmanQuests++
              if (this.$store.get('progress/quest_complete', tempQuests[i].id) == true) ragmanComplete++
              break
            case 'jaeger':
              jaegerQuests++
              if (this.$store.get('progress/quest_complete', tempQuests[i].id) == true) jaegerComplete++
              break
          }
        }

        var chartData = {
          labels: ['Prapor', 'Therapist', 'Skier', 'Peacekeeper', 'Mechanic', 'Ragman', 'Jaeger'],
          series: [
            [
              praporComplete,
              therapistComplete,
              skierComplete,
              peacekeeperComplete,
              mechanicComplete,
              ragmanComplete,
              jaegerComplete,
            ],
            [
              praporQuests - praporComplete,
              therapistQuests - therapistComplete,
              skierQuests - skierComplete,
              peacekeeperQuests - peacekeeperComplete,
              mechanicQuests - mechanicComplete,
              ragmanQuests - ragmanComplete,
              jaegerQuests - jaegerComplete,
            ],
          ],
        }

        return chartData
      },
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
