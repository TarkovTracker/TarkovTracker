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
              center-active
              centered
            >
              <v-tab
                v-for="(map, mIndex) in maps"
                :key="mIndex"
                :to="'/maps/'+ map.toLowerCase()"
                exact
                replace
              >
                <v-icon class="mr-2">
                  mdi-map
                </v-icon>
                <v-badge
                  :value="$root.mapAvailability[map.toLowerCase()] >= 1"
                  color="primary"
                  :content="$root.mapAvailability[map.toLowerCase()]"
                >
                  {{ map }}
                </v-badge>
              </v-tab>
            </v-tabs>
          </template>
          <router-view :map-name="mapName" />
        </material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    props: {
      mapName: {
        type: String
      }
    },
    data () {
      return {
        progressValue: 0,
        activeTraderTab: 0,
        maps: ['Factory', 'Customs', 'Woods', 'Shoreline', 'Interchange', 'Reserve', 'Labs']
      }
    },
    metaInfo: {
      // Children can override the title.
      title: 'Maps',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plan your raid, seeing available quests by map, as well as items, keys, and friends you need to bring with you.' }
      ]
    },
    computed: {
    },
    mounted () {
    },
    methods: {
    }
  }
</script>
