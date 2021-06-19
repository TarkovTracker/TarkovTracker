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
      <div class="text-center my-10">
        <v-tabs
          v-model="activeSkillsTab"
          :active-class="`success white--text`"
          background-color="transparent"
          class="v-tabs--pill"
          centered
          hide-slider
        >
          <v-tab class="mr-3">
            <v-icon class="mr-2">
              mdi-all-inclusive
            </v-icon>
            All
          </v-tab>
          <v-tab class="mr-3">
            <v-icon class="mr-2">
              mdi-clipboard-check
            </v-icon>
            Quests
          </v-tab>
          <v-tab>
            <v-icon class="mr-2">
              mdi-home
            </v-icon>
            Hideout
          </v-tab>

          <v-tabs-items
            v-model="activeSkillsTab"
            style="background: transparent !important"
          >
            <v-tab-item
              class="pa-4 text-body-2 font-weight-light"
            >
              <div
                v-if="sortAllUnlocked.length === 0"
                style="text-align: center;"
              >
                No Skills to Track!
              </div>
              <v-row class="mt-1">
                <v-col
                  v-for="(skill, skillKey) in sortAllUnlocked"
                  :key="skillKey"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <skill-card :skill-details="skill" />
                </v-col>
              </v-row>
            </v-tab-item>
            <v-tab-item
              class="pa-4 text-body-2 font-weight-light"
            >
              <div
                v-if="sortQuestUnlocked.length === 0"
                style="text-align: center;"
              >
                No Skills to Track!
              </div>
              <v-row class="mt-1">
                <v-col
                  v-for="(skill, skillKey) in sortQuestUnlocked"
                  :key="skillKey"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <skill-card :skill-details="skill" />
                </v-col>
              </v-row>
            </v-tab-item>
            <v-tab-item
              class="pa-4 text-body-2 font-weight-light"
            >
              <div
                v-if="sortHideout.length === 0"
                style="text-align: center;"
              >
                No Skills to Track!
              </div>
              <v-row class="mt-1">
                <v-col
                  v-for="(skill, skillKey) in sortHideout"
                  :key="skillKey"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <skill-card :skill-details="skill" />
                </v-col>
              </v-row>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </div>
    </v-responsive>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        activeSkillsTab: 0,
        needed_skills: [],
      }
    },
    metaInfo: {
      // Children can override the title.
      title: 'Skills',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Keep track of the skills you need to level in Escape From Tarkov to continue your progression.' },
      ],
    },
    computed: {
      sortAllUnlocked: function () {
        return this.needed_skills.slice().sort((a, b) => (a.unlocked > b.unlocked || a.type === 'hideout') ? 1 : -1)
      },
      sortQuestUnlocked: function () {
        return this.needed_skills.slice().filter(x => x.type === 'quest').sort((a, b) => (a.unlocked > b.unlocked) ? 1 : -1)
      },
      sortHideout: function () {
        return this.needed_skills.slice().filter(x => x.type === 'hideout')
      },
    },
    mounted () {
      this.refreshPage()
    },
    methods: {
      refreshPage () {
        this.needed_skills = []
        this.refreshQuests()
        this.refreshHideout()
      },
      refreshQuests () {
        var tempQuests = this.questDataDefault
        var i
        for (i = 0; i < tempQuests.length; i++) {
          if (tempQuests[i].deprecated === true) {
            // Don't show this quest - its deprecated
            continue
          }
          for (var x = tempQuests[i].objectives.length - 1; x >= 0; x--) {
            if (tempQuests[i].objectives[x].type === 'skill' && this.$store.get('progress/objective_complete', tempQuests[i].objectives[x].id) === false) {
              this.needed_skills.push(
                {
                  name: tempQuests[i].objectives[x].target,
                  number: tempQuests[i].objectives[x].number,
                  for: tempQuests[i].giver,
                  quest: tempQuests[i].title,
                  questId: tempQuests[i].id,
                  objective: tempQuests[i].objectives[x].id,
                  unlocked: this.calculateUnlocked(tempQuests[i], this.$store),
                  type: 'quest',
                  nokappa: tempQuests[i].nokappa,
                })
            }
          }
        }
      },
      refreshHideout () {
        var tempHideout = this.hideoutDataDefault

        for (var i = tempHideout.length - 1; i >= 0; i--) {
          if (this.$store.get('progress/hideout_complete', tempHideout[i].id) === false) {
            for (var x = tempHideout[i].require.length - 1; x >= 0; x--) {
              if (tempHideout[i].require[x].type === 'skill' && this.$store.get('progress/hideout_objective_complete', tempHideout[i].require[x].id) === false) {
                this.needed_skills.push({
                  name: tempHideout[i].require[x].name,
                  number: tempHideout[i].require[x].quantity,
                  for: tempHideout[i].module,
                  forLevel: tempHideout[i].level,
                  objective: tempHideout[i].require[x].id,
                  type: 'hideout',
                })
              }
            }
          }
        }
      },
    },
  }
</script>
<style lang="sass">
  .v-tabs--pill
    .v-tab,
    .v-tab:before
      border-radius: 24px

    &.v-tabs--icons-and-text
      &:not(.v-tabs--vertical) > .v-tabs-bar
        height: 100px
      .v-tab,
      .v-tab:before
        border-radius: 4px
</style>
