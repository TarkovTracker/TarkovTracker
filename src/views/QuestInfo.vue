<template>
  <v-container
    id="dashboard-view"
    fluid
    tag="section"
  >
    <v-row>
      <v-col cols="12">
        <material-card
          color="success"
          :title="thisQuest.title"
        >
          <v-card-text>
            <v-container
              fluid
            >
              <v-row>
                <v-col>
                  <div class="font-weight-bold">
                    Quick Facts:
                  </div>
                </v-col>
                <v-col>
                  <v-tooltip bottom v-if="myselfQuestAvailable(thisQuest) === -1">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        absolute
                        top
                        right
                        large
                        class="warning"
                        elevation="2"
                        @click="localQuestSkip(thisQuest)"
                      >
                        <v-icon>mdi-fast-forward</v-icon>
                      </v-btn>
                    </template>
                    <span>Jump to this quest (Complete all prerequisite quests)</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="myselfQuestAvailable(thisQuest) === 0">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        absolute
                        top
                        right
                        large
                        class="warning"
                        elevation="2"
                        @click="localQuestComplete(thisQuest)"
                      >
                        <v-icon>mdi-check-all</v-icon>
                      </v-btn>
                    </template>
                    <span>Complete this quest</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="myselfQuestAvailable(thisQuest) === 1">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        absolute
                        top
                        right
                        large
                        class="warning"
                        elevation="2"
                        @click="localQuestUncomplete(thisQuest)"
                      >
                        <v-icon>mdi-replay</v-icon>
                      </v-btn>
                    </template>
                    <span>Undo this quest</span>
                  </v-tooltip>
                </v-col>
              </v-row>
              <v-row>
                <v-divider />
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                  md="4"
                  lg="2"
                >
                  <div
                    v-if="'level' in thisQuest.require"
                    class="mt-1"
                  >
                    <v-icon>arrow_right</v-icon>Level: {{ thisQuest.require.level }}
                  </div>
                  <template v-if="'require' in thisQuest && 'loyalty' in thisQuest.require">
                    <div v-for="(loyalty, llindex) in thisQuest.require.loyalty" :key="llindex" class="mt-1">
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
                  </template>
                  <div
                    v-if="locationsList"
                    class="mt-1"
                  >
                    <v-icon>public</v-icon>{{ locationsList }}
                  </div>
                  <div
                    v-if="myselfCalculateUnlocked(thisQuest) > 0"
                    class="mt-1"
                  >
                    <v-icon>lock_open</v-icon>{{ myselfCalculateUnlocked(thisQuest) }} before
                  </div>
                  <div
                    v-if="calculateLocked(thisQuest) > 0"
                    class="mt-1"
                  >
                    <v-icon>lock</v-icon>{{ calculateLocked(thisQuest) }} behind
                  </div>
                  <div
                    v-if="thisQuest.nokappa"
                    class="mt-1"
                  >
                    <v-chip
                      class="ma-1 font-weight-bold"
                      x-small
                      color="error"
                    >
                      NOT KAPPA
                    </v-chip>
                  </div>
                  <div
                    v-if="'alternatives' in thisQuest"
                    class="mt-1"
                  >
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-chip
                          class="ma-1 font-weight-bold"
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
                          v-for="(quest, index) in calculateAlternatives(thisQuest)"
                          :key="index"
                        >
                          <b>{{ quest }}</b>
                        </div>
                      </span>
                    </v-tooltip>
                  </div>
                  <div class="mt-1">
                    <v-icon>info</v-icon><a
                      :href="thisQuest.wiki"
                      target="_blank"
                      class="info-link"
                    >Wiki page</a>
                  </div>
                </v-col>
                <v-divider
                  vertical
                />
                <v-col
                  cols="12"
                  md="4"
                  lg="2"
                >
                  <div class="mt-1">
                    <v-icon>emoji_people</v-icon>Given by {{ $root.traderDictionary[thisQuest.giver].locale.en }}
                  </div>
                  <div
                    v-if="thisQuest.exp > 0"
                    class="mt-1"
                  >
                    <v-icon>star_half</v-icon>+{{ thisQuest.exp }} EXP
                  </div>
                  <div
                    v-for="(repChange, index) in thisQuest.reputation"
                    :key="index"
                    class="mt-1"
                  >
                    <span v-if="repChange.rep > 0"><v-icon>mood</v-icon><span class="green--text">+{{ repChange.rep }}</span>
                    </span>
                    <span v-else>
                      <v-icon>mood_bad</v-icon><span class="red--text">{{ repChange.rep }}</span>
                    </span> with {{ $root.traderDictionary[repChange.trader].locale.en }}
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <div class="font-weight-bold">
                    Objectives:
                  </div>
                  <v-divider />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <div
                    v-for="objective in thisQuest.objectives"
                    :key="objective.id"
                    class="md-small-details"
                  >
                    <quest-objective
                      :quest-objective="objective"
                      :quest-interact="false"
                      :quest-id="Number(id)"
                    />
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <div class="font-weight-bold">
                    Related Quests:
                  </div>
                  <v-divider />
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  v-if="myselfCalculateUnlocked(thisQuest) > 0"
                  cols="12"
                  md="4"
                  lg="3"
                >
                  <div class="font-weight-medium mb-2">
                    Quests needed to unlock:
                  </div>
                  <div
                    v-for="(unlocker, index) in calculateUnlockedList(thisQuest, $store)"
                    :key="index"
                  >
                    <quest-link :quest-id="unlocker.id" />
                  </div>
                </v-col>
                <v-divider
                  v-if="calculateLocked(thisQuest) > 0 && myselfCalculateUnlocked(thisQuest) > 0"
                  vertical
                />
                <v-col
                  v-if="calculateLocked(thisQuest) > 0"
                  cols="12"
                  md="4"
                  lg="3"
                >
                  <div class="font-weight-medium mb-2">
                    Quests locked behind:
                  </div>
                  <div
                    v-for="(locker, index) in calculateLockedList(thisQuest)"
                    :key="index"
                  >
                    <quest-link :quest-id="locker.id" />
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <template v-slot:actions />
        </material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'QuestInfo',
    components: {
      QuestObjective: () => import('../components/QuestObjective.vue')
    },
    props: {
      id: {
        type: String
      }
    },
    data () {
      return {
        hoverQuest: null,
        hoverIndex: null
      }
    },
    computed: {
      thisQuest: function () {
        return this.$root.questDictionaryId[this.id]
      },
      // Return a string which is a list of related quest maps
      locationsList () {
        const locations = new Set()
        for (let i = this.thisQuest.objectives.length - 1; i >= 0; i--) {
          if (this.thisQuest.objectives[i].location >= 0) {
            locations.add(this.$root.mapDictionary[this.thisQuest.objectives[i].location].locale.en)
          }
        }
        return [...locations].join(', ')
      }
    },
    metaInfo: {
      // Children can override the title.
      title: 'Quest Details',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'See Tarkov quest details including objectives, requirements, and rewards.' }
      ]
    },
    methods: {
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
      }
    }
  }
</script>
<style lang="sass">
.v-icon
  margin-right:3px
</style>
