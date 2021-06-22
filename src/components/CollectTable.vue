<template>
  <v-container fluid>
    <v-row>
      <v-col cols="8">
        <v-text-field
          v-model="filterString"
          append-icon="mdi-magnify"
          label="Filter by item, quest, trader, or hideout module"
          single-line
          hide-details
          tabindex="1"
          @keyup.esc="clearFilter()"
        />
      </v-col>
      <v-col cols="2">
        <v-switch
          v-model="hideObtained"
          :label="`${hideObtained ? 'Hide Obtained' : 'Show Obtained'}`"
          class="ml-1"
        />
      </v-col>
      <v-col cols="2">
        <v-switch
          v-model="neededTotals"
          :label="`${neededTotals ? 'Show Totals' : 'Show Details'}`"
          class="ml-1"
        />
      </v-col>
    </v-row>

    <!-- Show totals table -->
    <v-data-table
      v-show="neededTotals"
      :headers="totalsHeaders"
      :items="totalsResult"
      :item-class="rowClasses"
      :search.sync="filterString"
      :hide-default-footer="true"
      group-desc
      multi-sort
      disable-pagination
    >
      <!-- Item Name Modifications -->
      <template v-slot:item.name="{ item }">
        <span class="font-weight-bold">
          <tarkov-item :id="item.itemId" :toolsLink="true" />
          <span v-if="'fir' in item && item.fir === true">
            <v-icon small class="icon-align">
              mdi-checkbox-marked-circle-outline
            </v-icon>
          </span>
        </span>
      </template>

      <!-- Item Needed Modifications -->
      <template v-slot:item.number="{ item }">
        <v-btn-toggle
          background-color="transparent"
          active-class="none"
          borderless
        >
          <v-btn
            text
            small
            @click="editToggleTotalHaveCount(item)"
          >
            {{ item.have }} / {{ item.number }}
          </v-btn>
        </v-btn-toggle>
      </template>

      <!-- Item For Modications -->
      <template v-slot:item.for="{ item }">
        <span v-for="(questNeed, index) in item.for.quests">
          <quest-link :quest-id="questNeed.quest.id" />
        </span>
        <span v-for="(hideoutModule, index) in item.for.hideout">
          {{ hideoutModule.name }}
          <span class="font-weight-bold">
            Level {{ hideoutModule.level }}
          </span>
        </span>
      </template>
    </v-data-table>

    <!-- Show Details table -->
    <v-data-table
      v-show="!neededTotals"
      :headers="detailsHeaders"
      :items="sortUnlocked"
      :item-class="rowClasses"
      :search.sync="filterString"
      :hide-default-footer="true"
      group-by="type"
      group-desc
      multi-sort
      disable-pagination
    >
      <!-- Item Name Modifications -->
      <template v-slot:item.name="{ item }">
        <span class="font-weight-bold">
          <tarkov-item :id="item.itemId" :fir="item.fir" :toolsLink="true" />
          <span v-if="item.teamHave && Object.keys(item.teamHave).length > 0">
            
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  small
                  class="ml-2 icon-align"
                  v-bind="attrs"
                  v-on="on"
                >
                  mdi-account-group
                </v-icon>
              </template>
              <span>
                <div
                  v-for="(amountHave, valueIndex) in Object.values(item.teamHave)"
                  :key="valueIndex"
                >
                    <teammate-identity
                      :teammate="$root.team[Object.keys(item.teamHave)[valueIndex]]"
                      left
                    /> needs {{ item.number - amountHave }}
                </div>
              </span>
            </v-tooltip>
          </span>
        </span>
      </template>

      <!-- Item Needed Modifications -->
      <template v-slot:item.number="{ item }">
        <span v-if="item.type === 'quest' ? !$store.get('progress/objective_complete', item.objective) : !$store.get('progress/hideout_objective_complete', item.objective)">
          <v-btn-toggle
            background-color="transparent"
            active-class="none"
            borderless
          >
            <v-btn
              icon
              small
              @click="editDecreaseHaveCount(item)"
            >
              <v-icon small>
                mdi-minus
              </v-icon>
            </v-btn>

            <v-btn
              text
              small
              @click="editToggleHaveCount(item)"
            >
              {{ item.have }} / {{ item.number }}
            </v-btn>

            <v-btn
              icon
              small
              @click="editIncreaseHaveCount(item)"
            >
              <v-icon small>
                mdi-plus
              </v-icon>
            </v-btn>
          </v-btn-toggle>
        </span>
      </template>

      <!-- Item For Modications -->
      <template v-slot:item.unlocked="{ item }">
        <div>
          <span v-if="item.type === 'quest'">
            <quest-link :quest-id="item.quest.id" />
          </span>
          <span
            v-else-if="item.type === 'hideout'"
            class="font-weight-bold"
          >
            {{ $root.hideoutStationDictionary[item.for.stationId].locales.en }} Level {{ item.forLevel }}
          </span>
        </div>
        <div v-if="'quest' in item">
          <span v-if="item.unlocked">
            <v-icon small class="icon-align">
              mdi-lock-open
            </v-icon>
            {{ item.unlocked }} before
          </span>
          <span v-if="item.nokappa">
            <v-chip
              class="ma-1 font-weight-bold"
              x-small
              color="error"
            >
              NOT KAPPA
            </v-chip>
          </span>
          <span v-if="'alternative' in item.quest">
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
                  v-for="(quest, index) in calculateAlternatives(item.quest)"
                  :key="index"
                >
                  <b>{{ quest }}</b>
                </div>
              </span>
            </v-tooltip>

          </span>
        </div>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
// import {Badge} from "@/components";
  export default {
    name: 'CollectTable',
    // components: {Badge},
    props: {
      targetType: {
        type: Array,
      },
    },
    data () {
      return {
        selected: [],
        filterString: '',
        detailsHeaders:
          [
            { text: 'Item', value: 'name' },
            { text: 'Needed', value: 'number' },
            { text: 'For', value: 'unlocked' },
          ],
        totalsHeaders:
          [
            { text: 'Item', value: 'name' },
            { text: 'Needed', value: 'number' },
            { text: 'For', value: 'for' },
          ],
      }
    },
    computed: {
      needed_items: function () {
        return this.$root.questItems
          .concat(this.$root.hideoutItems)
          .map(item => ({
            ...item,
            name: this.$root.itemDictionary[item.itemId].name,
            shortName: this.$root.itemDictionary[item.itemId].shortName
          }))
      },

      obtainedResult: function () {
        return this.hideObtained ? this.needed_items.filter(x => x.have < x.number) : this.needed_items
      },

      sortUnlocked: function () {
        return this.obtainedResult.slice().sort((a, b) => (a.unlocked > b.unlocked || a.forLevel > b.forLevel) ? 1 : -1)
      },

      totalsResult: function () {
        var onlyMine = this.obtainedResult.filter(x => x.type == 'quest' ?
          this.$store.copy('progress/objective_complete', x.objective) == false
          :
          this.$store.copy('progress/hideout_objective_complete', x.objective) == false
        )

        var neededTotals = onlyMine.reduce((acc, value) =>
          ({ ...acc, [value.itemId]: (acc[value.itemId] + value.number || value.number) }), {})

        var haveTotals = onlyMine.reduce((acc, value) =>
          ({ ...acc, [value.itemId]: (acc[value.itemId] + value.have || value.have) }), {})

        var questForTotals = onlyMine.filter(x => x.type === 'quest').reduce((acc, value) =>
          ({ ...acc, [value.itemId]: (Array.isArray(acc[value.itemId]) ? acc[value.itemId].push(value.quest) : [value.quest]) }), {})

        var totals = Object.keys(neededTotals).map(x => new Object({
          itemId: x,
          number: neededTotals[x],
          have: haveTotals[x],
          for: {
            quests: onlyMine
              .filter(y => y.itemId == x && y.type == 'quest')
              .map(z => new Object({ quest: z.quest, objective: z.objective })),
            hideout: onlyMine
              .filter(y => y.itemId == x && y.type == 'hideout')
              .map(z => new Object({ itemId: this.$root.hideoutStationDictionary[z.for.stationId].locales.en, level: z.forLevel, objective: z.objective })),
          },
        }))
        return totals
      },

      hideObtained: {
        get () {
          return this.$store.copy('user/hideObtained')
        },
        set (value) {
          this.$store.set('user/hideObtained', value)
        },
      },

      neededTotals: {
        get () {
          return this.$store.copy('user/neededTotals')
        },
        set (value) {
          this.$store.set('user/neededTotals', value)
        },
      },
    },

    mounted () {
      //this.refreshPage()
    },

    methods: {
      rowClasses (item) {
        if (item.type == 'quest') {
          if (this.$store.get('progress/objective_complete', item.objective)) {
            return 'objectivecomplete'
          }
        }
        if (item.have >= item.number) {
          return 'enough'
        }
      },

      filterShow: function (items, search, filter) {
        if (this.filterString == '') {
          return true
        } else {
          if ('name' in item && item.name.toLowerCase().includes(this.filterString.toLowerCase())) {
            // Found the filter string in our name, we're a match
            return true
          } else if ('for' in item && item.for.toLowerCase().includes(this.filterString.toLowerCase())) {
            return true
          } else if ('quest' in item && item.quest.title.toLowerCase().includes(this.filterString.toLowerCase())) {
            return true
          } else {
            return false
          }
        }
      },

      clearFilter: function () {
        this.filterString = ''
      },

      editIncreaseHaveCount (item) {
        if (item.type == 'quest') {
          // Check for Roubles, Euros, and Dollars
          if (['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(item.id)) {
            this.$store.set('progress/increase_objective_have', { id: item.objective, amount: 1000 })
          } else {
            this.$store.set('progress/increase_objective_have', { id: item.objective, amount: 1 })
          }
        } else if (item.type == 'hideout') {
          if (['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(item.id)) {
            this.$store.set('progress/increase_hideout_objective_have', { id: item.objective, amount: 1000 })
          } else {
            this.$store.set('progress/increase_hideout_objective_have', { id: item.objective, amount: 1 })
          }
        }

        this.$analytics.logEvent('increase_gather', {
          event_category: 'Collection',
          event_label: `Increased item count of ${item.name}`,
          quests_previously: this.$store.get('progress/quests_array').filter(x => x.complete).length,
          objective_id: item.objective,
        })
      },

      editToggleHaveCount (item) {
        if (item.type == 'quest') {
          this.toggleQuestObjectiveHaveCount(item.objective)
        } else if (item.type == 'hideout') {
          this.toggleHideoutObjectiveHaveCount(item.objective)
        }
        this.$analytics.logEvent('toggle_gather', {
          event_category: 'Collection',
          event_label: `Toggled item count of ${item.name}`,
          quests_previously: this.$store.get('progress/quests_array').filter(x => x.complete).length,
          objective_id: item.objective,
        })
      },

      toggleQuestObjectiveHaveCount (objective) {
        var objectiveNeed = this.$root.objectiveDictionary[objective].number
        if (this.$store.get('progress/objective_have', objective) >= objectiveNeed) {
          this.$store.set('progress/set_objective_have', { id: objective, amount: 0 })
        } else {
          this.$store.set('progress/set_objective_have', { id: objective, amount: objectiveNeed })
        }
      },

      toggleHideoutObjectiveHaveCount (objective) {
        var objectiveNeed = this.$root.hideoutObjectiveDictionary[objective].quantity
        if (this.$store.get('progress/hideout_objective_have', objective) >= objectiveNeed) {
          this.$store.set('progress/set_hideout_objective_have', { id: objective, amount: 0 })
        } else {
          this.$store.set('progress/set_hideout_objective_have', { id: objective, amount: objectiveNeed })
        }
      },

      editToggleTotalHaveCount (item) {
        // Toggle for all objectives in a total row
        item.for.quests.forEach((questNeed) => {
          this.toggleQuestObjectiveHaveCount(questNeed.objective)
        }, this)
        item.for.hideout.forEach((hideoutNeed) => {
          this.toggleHideoutObjectiveHaveCount(hideoutNeed.objective)
        }, this)

        this.$analytics.logEvent('toggle_total_gather', {
          event_category: 'Collection',
          event_label: `Toggled total item count of ${item.name}`,
          quests_previously: this.$store.get('progress/quests_array').filter(x => x.complete).length,
          objective_id: item.objective,
        })
      },

      editDecreaseHaveCount (item) {
        if (item.type == 'quest') {
          if (['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(item.id)) {
            this.$store.set('progress/decrease_objective_have', { id: item.objective, amount: 1000 })
          } else {
            this.$store.set('progress/decrease_objective_have', { id: item.objective, amount: 1 })
          }
        } else if (item.type == 'hideout') {
          if (['5449016a4bdc2d6f028b456f', '569668774bdc2da2298b4568', '5696686a4bdc2da3298b456a'].includes(item.id)) {
            this.$store.set('progress/decrease_hideout_objective_have', { id: item.objective, amount: 1000 })
          } else {
            this.$store.set('progress/decrease_hideout_objective_have', { id: item.objective, amount: 1 })
          }
        }
        this.$analytics.logEvent('decrease_gather', {
          event_category: 'Collection',
          event_label: `Decreased item count of ${item.name}`,
          quests_previously: this.$store.get('progress/quests_array').filter(x => x.complete).length,
          objective_id: item.objective,
        })
      },
    },
  }
</script>
<style lang="sass">
.quest-link
  text-decoration: none
  color: #00acc1 !important

.icon-align
  vertical-align: text-top !important

</style>
