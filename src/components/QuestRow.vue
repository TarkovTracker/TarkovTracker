<template>
  <v-lazy
    :options="{
      threshold: .5
    }"
    min-height="75"
    transition="fade-transition"
    :class="teamAvailableClass(availability)"
  >
    <v-container
      fluid
      class="py-2 quest-row"
    >
      <v-row
        align="center"
        no-gutters
      >
        <v-col
          cols="12"
          md="3"
        >
          <span class="quest-title">
            <quest-link :quest-id="questDetails.id" />
          </span>
          <div class="stats">
            <v-icon class="mr-1">
              mdi-menu-right
            </v-icon>Level: {{ questDetails.require.level }}
          </div>
          <div v-if="'require' in questDetails && 'loyalty' in questDetails.require" v-for="(loyalty, llindex) in questDetails.require.loyalty" class="mb-1">
              <img
                class="img"
                :src="traderIcon(loyalty.trader)"
                style="height:1.5em;width:auto;border-radius:25%;vertical-align:middle;"
              >
              <span v-if="loyalty.stage === 4">
                Loyalty <v-icon class="objective-icon-bottom" small>mdi-crown</v-icon>
              </span>
              <span v-else>
                Loyalty {{loyalty.stage}}
              </span>
          </div>
          <div v-if="pageType != 'completed' && myselfCalculateUnlocked(questDetails)">
            <v-icon class="mr-1">
              lock_open
            </v-icon>{{ myselfCalculateUnlocked(questDetails) }} before
          </div>
          <div v-if="calculateLocked(questDetails)">
            <v-icon class="mr-1">
              lock
            </v-icon>{{ calculateLocked(questDetails) }} behind
          </div>
          <div v-if="questDetails.wiki">
            <a
              :href="questDetails.wiki"
              target="_blank"
              class="info-link"
            ><v-icon class="mr-1">info</v-icon>Wiki page</a>
          </div>
          <div v-if="questDetails.nokappa === true">
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  class="mt-1 font-weight-bold"
                  x-small
                  color="error"
                  v-bind="attrs"
                  v-on="on"
                >
                  NOT KAPPA
                </v-chip>
              </template>
              <span>Not required to achieve Kappa</span>
            </v-tooltip>
          </div>
          <div
            v-if="typeof questDetails.alternatives !== 'undefined' && questDetails.alternatives.length > 0"
          >
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  class="mt-1 font-weight-bold"
                  x-small
                  color="info"
                  v-bind="attrs"
                  v-on="on"
                >
                  ALTERNATIVES
                </v-chip>
              </template>
              <span>
                Complete one of:
                <div
                  v-for="(title, index) in calculateAlternatives(questDetails)"
                  :key="index"
                >
                  <b>{{ title }}</b>
                </div>
              </span>
            </v-tooltip>
          </div>
          <span v-if="typeof availability !== 'undefined' && availability.length > 1">
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  class="mt-1 font-weight-bold"
                  x-small
                  :color="teamBadgeClass(availability)"
                  v-bind="attrs"
                  v-on="on"
                >
                  TEAMMATES
                </v-chip>
              </template>
              <span>
                Team progress:
                <div
                  v-for="(teammate, index) in availability"
                  :key="index"
                >
                  <teammate-identity
                    :teammate="teammate.identity"
                    left
                  /> {{ teammate.status == 1 ? "Completed" : teammate.status == 0 ? "on quest" : "behind by " + Math.abs(teammate.status) }}
                </div>
              </span>
            </v-tooltip>
          </span>
        </v-col>
        <v-col
          cols="12"
          md="7"
        >
          <div
            v-for="objective in questDetails.objectives"
            :key="objective.id"
            :disabled="pageType != 'available' || Number(myselfQuestAvailable(questDetails)) != 0"
            v-on="(pageType === 'available' && myselfQuestAvailable(questDetails) == 0) ? { click: () => localToggleObjective(objective) } : {click: ($event) => $event.preventDefault() }"
          >
            <quest-objective
              :quest-objective="objective"
              :quest-interact="true"
              :quest-id="questDetails.id"
            />
          </div>
          <div
            v-if="questDetails.objectives.length != $root.questDictionaryId[questDetails.id].objectives.length"
            class="mt-2 text--disabled text-caption"
          >
            {{ $root.questDictionaryId[questDetails.id].objectives.length - questDetails.objectives.length}} objectives not on this map
          </div>
        </v-col>
        <v-col
          cols="12"
          md="2"
          align="center"
          align-md="end"
          class="align-md-end"
        >
          <span v-if="pageType === 'available' && myselfQuestAvailable(questDetails) === 0">
            <v-btn
              large
              class="success"
              elevation="2"
              @click="localQuestComplete(questDetails)"
            >
              <v-icon>mdi-check-all</v-icon>
            </v-btn>
          </span>
          <span v-else-if="pageType === 'locked' && myselfQuestAvailable(questDetails) === -1">
            <v-btn
              large
              class="warning"
              elevation="2"
              @click="localQuestSkip(questDetails)"
            >
              <v-icon>mdi-fast-forward</v-icon>
            </v-btn>
          </span>
          <span v-else-if="pageType === 'completed' && myselfQuestAvailable(questDetails) === 1">
            <v-btn
              large
              class="error"
              elevation="2"
              @click="localQuestUncomplete(questDetails)"
            >
              <v-icon>mdi-replay</v-icon>
            </v-btn>
          </span>
        </v-col>
      </v-row>
    </v-container>
  </v-lazy>
</template>
<script>
  export default {
    name: 'QuestRow',
    components: {
      QuestObjective: () => import('./QuestObjective.vue'),
    },
    props: {
      questDetails: Object,
      pageType: String,
      teamState: Boolean,
    },
    data () {
      return {
      }
    },
    computed: {
      availability: function() {
        var availability = []
        this.$root.team.forEach((member, memberIndex) => {
          availability.push({
            identity: member,
            status: this.$root.questAvailability[this.questDetails.id][memberIndex] >= 0 ? this.$root.questAvailability[this.questDetails.id][memberIndex] : 0 - this.calculateUnlocked(this.questDetails, member.store),
          })
        }, this)
        return availability
      }
    },
    methods: {
      teamBadgeClass (availability) {
        if (availability) {
          if (availability.filter(y => y.identity.self)[0].status >= 1) {
            return 'success'
          } else if (availability.filter(y => y.identity.self)[0].status == 0) {
            return 'info'
          } else {
            return 'warning'
          }
        } else {
          return 'info'
        }
      },
      teamAvailableClass (availability) {
        if (availability) {
          return {
            'tarkov-with-team': availability.filter(y => y.identity.self && y.status == 0).length == 1,
            'tarkov-ahead-team': availability.filter(y => y.identity.self && y.status > 0).length == 1,
            'tarkov-behind-team': availability.filter(y => y.identity.self && y.status < 0).length == 1,
          }
        } else {
          return {
            'tarkov-with-team': true,
            'tarkov-ahead-team': false,
            'tarkov-behind-team': false,
          }
        }
      },
      localToggleObjective (objective) {
        // Calls the common mixin toggle objective
        this.ToggleObjective(objective)
      },
      localQuestComplete (quest) {
        // Call the common mixin complete quest
        this.CompleteQuest(quest)
      },
      localQuestSkip (quest) {
        // Call the common mixin skip to quest
        this.QuestSkip(quest)
      },
      localQuestUncomplete (quest) {
        // Call the common mixin uncomplete quest
        this.QuestUncomplete(quest)
      },
    },
  }
</script>
<style lang="sass">
.quest-title
  font-weight: bold

.objective-icon-sub
  vertical-align: text-top !important

.objective-icon-bottom
  vertical-align: text-bottom !important

.info-link
  text-decoration: none
  color: #00acc1 !important

.quest-link a
  text-decoration: none
  color: var(--v-questlink-base) !important
  font-weight: bold

.quest-row
  border-bottom-style: solid
  border-width: 1px
  border-color: var(--v-bgdarken-lighten1)

.tarkov-ahead-team
  background: linear-gradient(to left, var(--v-bgdarken-base), var(--v-objectivecomplete-base))

.tarkov-ahead-team:hover
  background: linear-gradient(to left, var(--v-bgdarken-lighten3), var(--v-objectivecomplete-base)) !important

.tarkov-behind-team
  background: linear-gradient(to left, var(--v-bgdarken-base), var(--v-objectiveuncomplete-base))

.tarkov-behind-team:hover
  background: linear-gradient(to left, var(--v-bgdarken-lighten3), var(--v-objectiveuncomplete-base)) !important
</style>
