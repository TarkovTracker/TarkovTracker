<template>
  <v-container
    id="grid-view"
    fluid
    tag="section"
  >
    <v-row>
      <v-col
        cols="12"
      >
        <material-card
          color="success"
          full-header
        >
          <template #heading>
            <v-tabs
              v-model="activeTraderTab"
              background-color="transparent"
              color="white"
              slider-color="white"
              class="pa-4"
              centered
            >
              <v-tab
                class="mr-3"
                :to="'/trader/'+traderName.toLowerCase()+'/available'"
                exact
                replace
              >
                <v-icon class="mr-2">
                  mdi-clipboard-text
                </v-icon>
                Available
              </v-tab>
              <v-tab
                class="mr-3"
                :to="'/trader/'+traderName.toLowerCase()+'/locked'"
                exact
                replace
              >
                <v-icon class="mr-2">
                  mdi-lock
                </v-icon>
                Locked
              </v-tab>
              <v-tab
                :to="'/trader/'+traderName.toLowerCase()+'/completed'"
                exact
                replace
              >
                <v-icon class="mr-2">
                  mdi-clipboard-check
                </v-icon>
                Completed
              </v-tab>
            </v-tabs>
          </template>
          <router-view
            :trader-name="traderName"
            :availability="availability"
          />
        </material-card>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col
        cols="3"
        align="center"
      >
          <a
            :href="traderLink"
            target="_blank"
          >
            <v-progress-circular
              rotate="270"
              :value="traderProgress"
              width="8"
              color="objectivecomplete"
              size="150"
            >
              <img
                class="trader-avatar elevation-6"
                :src="traderIcon(traderName)"
                width="100% vw"
              >
            </v-progress-circular>
          </a>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    props: {
      traderName: {
        type: String,
      },
      availability: {
        type: String,
      },
    },
    data () {
      return {
        activeTraderTab: 0,
      }
    },
    computed: {
      traderProgress: function () {
        var traderQuests = this.questDataDefault
          .filter(quest => quest.giver.toLowerCase() === this.properTraderName.toLowerCase())

        var traderComplete = traderQuests
          .filter(quest => this.$store.get('progress/quest_complete', quest.id) === true)

        return (traderComplete.length / traderQuests.length) * 100
      },
      properTraderName: function () {
        var traderName
        switch (this.traderName.toLowerCase()) {
          case 'prapor':
            traderName = 'Prapor'
            break
          case 'therapist':
            traderName = 'Therapist'
            break
          case 'skier':
            traderName = 'Skier'
            break
          case 'peacekeeper':
            traderName = 'Peacekeeper'
            break
          case 'mechanic':
            traderName = 'Mechanic'
            break
          case 'ragman':
            traderName = 'Ragman'
            break
          case 'jaeger':
            traderName = 'Jaeger'
            break
          case 'fence':
            traderName = 'Fence'
            break
        }
        return traderName
      },
      traderLink: function () {
        var traderLink
        switch (this.traderName.toLowerCase()) {
          case 'prapor':
            traderLink = 'https://escapefromtarkov.gamepedia.com/Prapor'
            break
          case 'therapist':
            traderLink = 'https://escapefromtarkov.gamepedia.com/Therapist'
            break
          case 'skier':
            traderLink = 'https://escapefromtarkov.gamepedia.com/Skier'
            break
          case 'peacekeeper':
            traderLink = 'https://escapefromtarkov.gamepedia.com/Peacekeeper'
            break
          case 'mechanic':
            traderLink = 'https://escapefromtarkov.gamepedia.com/Mechanic'
            break
          case 'ragman':
            traderLink = 'https://escapefromtarkov.gamepedia.com/Ragman'
            break
          case 'jaeger':
            traderLink = 'https://escapefromtarkov.gamepedia.com/Jaeger'
            break
        }
        return traderLink
      },
    },
    mounted () {
    },
    methods: {
    },
    metaInfo: {
      // Children can override the title.
      title: 'Traders',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'View and manage quests by Trader' },
      ],
    },
  }
</script>
<style lang="sass">
.trader-avatar
  border-radius: 50% !important
</style>
