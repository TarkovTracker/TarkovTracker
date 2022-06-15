<template>
  <v-container fluid class="pa-0">
    <span class="text-caption tracker-quest-objective" :class="objectiveClass" @mouseover="hoverIndex = questObjective"
      @mouseleave="hoverIndex = null">
      <span
        v-if="questInteract && $root.questAvailability[questId][0] == 0 && hoverIndex === questObjective && questObjective.completed === false">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon small v-bind="attrs" class="mr-1 objective-icon-sub" v-on="on">done</v-icon>
          </template>
          <span>Complete Objective</span>
        </v-tooltip>
      </span>
      <span
        v-else-if="questInteract && $root.questAvailability[questId][0] == 0 && hoverIndex === questObjective && questObjective.completed === true">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon small v-bind="attrs" class="mr-1 objective-icon-sub" v-on="on">clear</v-icon>
          </template>
          <span>Uncomplete Objective</span>
        </v-tooltip>
      </span>
      <span v-else>
        <v-icon small class="mr-1 objective-icon-sub">{{ objectiveIcon }}</v-icon>
      </span>
      <!-- Handle optional key arrays -->
      <span v-if="questObjective.type === 'key' && Array.isArray(questObjective.target)">
        <b v-for="(specificKey, keyIndex) in questObjective.target" :key="`optkey-${keyIndex}`">
          <tarkov-item :id="specificKey" format="minimal" />
          <span v-if="keyIndex < questObjective.target.length - 1"> OR </span>
        </b> needed on {{ locationLanguage }}
      </span>
      <!-- Handle standard key situation -->
      <span v-else-if="questObjective.type === 'key'">
        <b>
          <tarkov-item :id="questObjective.target" format="minimal" />
        </b> needed on {{ locationLanguage }}
      </span>
      <span v-else-if="questObjective.type === 'kill'">Eliminate {{ questObjective.number }} {{ questObjective.target }}
        <span v-if="questObjective.location >= 0">on {{ locationLanguage }}</span><span v-if="questObjective.with"> with
          <b>{{ questObjective.with.join(", ") }}</b></span></span>
      <span v-else-if="questObjective.type === 'collect'">Hand over {{ questObjective.number }} <b>
          <tarkov-item :id="questObjective.target" format="minimal" />
        </b></span>
      <span v-else-if="questObjective.type === 'find'">Find in raid {{ questObjective.number }} <b>
          <tarkov-item :id="questObjective.target" format="minimal" />
        </b></span>
      <span v-else-if="questObjective.type === 'pickup'">Pick-up <b>{{ questObjective.target }}</b> <span
          v-if="questObjective.hint">({{ questObjective.hint }})</span> on {{ locationLanguage }}</span>
      <span v-else-if="questObjective.type === 'place'">Place <span v-if="questObjective.number > 1">{{
          questObjective.number
      }} </span> <b>
          <tarkov-item :id="questObjective.target" format="minimal" />
        </b> <span v-if="questObjective.hint">({{ questObjective.hint }})</span> on {{ locationLanguage }}
      </span>
      <span v-else-if="questObjective.type === 'mark'">Place <b>
          <tarkov-item :id="questObjective.tool" format="minimal" />
        </b> at <b>{{ questObjective.target }}</b> <span v-if="questObjective.hint">({{ questObjective.hint }})</span>
        on {{ locationLanguage }}
      </span>
      <span v-else-if="questObjective.type === 'reputation'">Reach loyalty level <b>{{ questObjective.number }}</b> with
        {{ getTraderName(questObjective.target) }}</span>
      <span v-else-if="questObjective.type === 'skill'">Reach skill level <b>{{ questObjective.number }}</b> with {{
          questObjective.target
      }}</span>
      <span v-else-if="questObjective.type === 'locate'">Locate <b>{{ questObjective.target }}</b> on {{
          locationLanguage
      }}</span>
      <span v-else-if="questObjective.type === 'build'">
        Build <b>
          <tarkov-item :id="questObjective.target" format="minimal" />
        </b> with
        <template
          v-if="'with' in questObjective && questObjective.with.filter(wItem => wItem.type == 'attachment').length > 0">
          <template v-for="attachment in questObjective.with.filter(wItem => wItem.type == 'attachment')">
            {{ attachment.value }} {{ attachment.name }},
          </template>
        </template>
        <template
          v-if="'with' in questObjective && questObjective.with.filter(wItem => wItem.type == 'stat').length > 0">
          <template v-for="stat in questObjective.with.filter(wItem => wItem.type == 'stat')">
            {{ stat.name }} {{ stat.value }},
          </template>
        </template>
        <template
          v-if="'with' in questObjective && questObjective.with.filter(wItem => wItem.type == 'part').length > 0">
          <span v-for="(part, partIndex) in questObjective.with.filter(wItem => wItem.type == 'part')" :key="partIndex">
            <template v-if="Array.isArray(part.id)">
              <span v-for="(optionalPart, optionalIndex) in part.id" :key="optionalIndex">
                <tarkov-item :id="optionalPart.id" format="minimal" />
                <template v-if="optionalIndex != part.id.length - 1">
                  OR
                </template>
                <template v-else>
                  ,
                </template>
              </span>
            </template>
            <template v-else>
              <tarkov-item :id="part.id" format="minimal" />,
            </template>
          </span>
        </template>
        <template
          v-if="'with' in questObjective && questObjective.with.filter(wItem => wItem.type == 'cells').length > 0">
          <template v-for="cells in questObjective.with.filter(wItem => wItem.type == 'cells')">
            total cells {{ cells.value }},
          </template>
        </template>

      </span>
      <span v-else-if="questObjective.type === 'warning'"><b>{{ questObjective.target }}</b></span>
      <span v-else>Formatting for {{ questObjective.type }} not completed</span>

      <v-icon v-if="useTeamObjectives && teammatesNeeding.length > 0" small class="ml-3 mr-2 objective-icon-sub">
        mdi-account-group
      </v-icon>
      <template v-if="useTeamObjectives">
        <span v-for="(teammate, mateIndex) in teammatesNeeding" :key="`teamneeded-${mateIndex}`" class="mr-3">
          <teammate-identity :teammate="teammate" />
        </span>
      </template>
    </span>
  </v-container>
</template>
<script>
import traderFunctions from '../functions/traderFunctions'

export default {
  name: 'QuestObjective',
  props: {
    questObjective: Object,
    questInteract: Boolean,
    questId: Number
  },
  data () {
    return {
      hoverIndex: null,
      objectiveIcons: {
        key: 'mdi-key',
        kill: 'mdi-target-account',
        collect: 'mdi-close-circle-outline',
        find: 'mdi-checkbox-marked-circle-outline',
        pickup: 'mdi-arrow-up-drop-circle-outline',
        mark: 'mdi-remote',
        place: 'mdi-arrow-down-drop-circle-outline',
        reputation: 'mdi-thumb-up',
        skill: 'mdi-dumbbell',
        locate: 'mdi-crosshairs-gps',
        build: 'mdi-progress-wrench',
        warning: 'mdi-alert-circle'
      }
    }
  },
  computed: {
    locationLanguage: function () {
      return this.$root.mapDictionary[this.questObjective.location].locale.en
    },
    objectiveIcon: function () {
      // Return the corresponding icon from objectiveIcons, or an alert if it doesnt exist
      return this.objectiveIcons[this.questObjective.type] !== undefined ? this.objectiveIcons[this.questObjective.type] : 'mdi-alert-circle'
    },
    teammatesNeeding: function () {
      if (this.useTeamObjectives) {
        return this.$root.team.filter((teammate, teamIndex) => this.$root.questAvailability[this.questId][teamIndex] === 0 && this.$root.objectiveAvailability[this.questObjective.id][teamIndex] === false)
      } else {
        return []
      }
    },
    useTeamObjectives: {
      get () {
        return this.$store.copy('user/useTeamObjectives') && this.$store.copy('user/useTeammates')
      }
    },
    objectiveClass: function () {
      return {
        'objective-complete': this.myselfObjectiveComplete(this.questObjective) == true,
        'objective-complete-interact': this.myselfObjectiveComplete(this.questObjective) == true &&
          this.$root.questAvailability[this.questId][0] == 0 && this.questInteract,
        'objective-enough': this.myselfObjectiveEnough(this.questObjective)
      }
    }
  },
  methods: {
    getTraderName: function (id) {
      return traderFunctions.getTraderById(id).locale.en
    }
  }
}
</script>
<style lang="sass">
.objective-complete
  background-color: var(--v-objectivecomplete-base) !important
  transition: background-color .2s ease, color .2s ease

.objective-complete-interact:hover
  background-color: var(--v-objectiveuncomplete-base)

.objective-enough
  background-color: var(--v-objectiveenough-base)

.tracker-quest-objective
  padding: 3px
  margin: -3px
  border-radius: 5px

.objective-icon-sub
  vertical-align: text-top !important

</style>
