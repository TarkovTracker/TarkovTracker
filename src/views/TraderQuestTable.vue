<template>
  <div>
    <v-simple-table>
      <tbody>
        <div v-if="available_quests.length === 0" class="text-center mb-3">
          <v-icon>mdi-help-circle</v-icon>There are no {{ availability }} {{ traderName.toLowerCase().capitalize() }} quests
        </div>
        <quest-row v-for="quest in sortLocked" :key="quest.id" :quest-details="quest" :page-type="availability" @questStateChanged="triggerUpdate()" />
      </tbody>
    </v-simple-table>
  </div>
</template>
<script>
export default {
  name: 'TraderQuestTable',
  components: {
    QuestRow: () => import('../components/QuestRow.vue')
  },
  props: {
    traderName: {
      type: String
    },
    availability: {
      type: String
    }
  },
  data () {
    return {}
  },
  metaInfo: {
    // Children can override the title.
    title: 'Traders',
    // Define meta tags here.
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: 'View and manage quests by Trader' }
    ]
  },
  computed: {
    sortLocked: function () {
      return this.available_quests.slice().sort((a, b) => (this.calculateLocked(a) < this.calculateLocked(b)) ? 1 : -1)
    },
    available_quests: function () {
      const availabilityComparator = {
        available: 0,
        locked: -1,
        completed: 1
      }

      const useTeammates = this.$store.copy('user/useTeammates') || false

      const traderQuests = this.questArrayCopy()
        // Filter by the quests available from this trader
        .filter(quest => quest.giver.toLowerCase() === this.traderName.toLowerCase())

      const availableQuests = traderQuests
        // Find quests where anyone on our team has this available according to the availability type of the page
        .filter(quest => useTeammates
          // If true, check if any teammates have this quest available
          ? Object.values(this.$root.questAvailability[quest.id]).some(availability => availability === availabilityComparator[this.availability])
          // If false, check if specifically we have this quest available
          : this.$root.questAvailability[quest.id][0] === availabilityComparator[this.availability]
        )
      // Map our personal completed status onto the quest object for rendering
      // .map(quest => Object.assign(quest, { completed: this.$store.get('progress/quest_complete', quest.id) }))

      return availableQuests
    }
  },
  mounted () {},
  methods: {}
}

</script>
