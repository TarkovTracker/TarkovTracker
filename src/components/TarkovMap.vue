<template>
  <v-container
    fluid
  >
    <v-row
      :style="{ height: (fullscreen ? '100vmin' : '100%') }"
    >
      <v-col
        cols="12"
        md="12"
        lg="9"
        xl="8"
        align-self="center"
        class="pa-0 ma-2"
      >
        <div :id="$id('svgmap')"
          class="mx-auto pa-0 map-box"
          v-bind:style="{ width: (fullscreen ? mapSize + 'vmin' : mapSize + '%'), position: 'relative' }"
        >
          <template
            v-for="objective in questObjectives.filter(o => hasFloor(o) && o.gps.floor == floors[layerSelect])"
          >
            <div 
              class="objective-glow" 
              v-show="hoverIndex == objective.id && searchHover == true" 
              v-bind:style="{ 
                position: 'absolute', 
                top: objective.gps.topPercent + '%', 
                left: objective.gps.leftPercent + '%', 
                transform: 'translate(-50%, -50%)' 
              }"
            />
            <v-menu
              v-model="hover[objective.id]"
              :close-on-content-click="false"
              top
              offset-y
              auto
              nudge-top="10"
              transition="scale-transition"
              v-bind:style="{ 
                transform: 'translate(-50%, 0%)' 
              }"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  v-bind:style="{ 
                    position: 'absolute', 
                    top: objective.gps.topPercent + '%', 
                    left: objective.gps.leftPercent + '%', 
                    transform: 'translate(-50%, -100%)' 
                  }"
                  color="orange darken-4"
                  :size="hoverIndex == objective.id && searchHover == true ? '2em' : undefined"
                  @mouseover="hoverIndex = objective.id"
                  @mouseleave="hoverIndex = null"
                >
                  {{ hoverIndex == objective.id ? 'mdi-map-marker-radius' : 'mdi-map-marker' }}
                </v-icon>
              </template>
              <v-card
                class="pa-2"
                elevation="6"
              >
                <quest-link 
                  v-for="quest in $root.objectiveDictionaryQuests[objective.id].quests"
                  :quest-id="quest"
                />
                <quest-objective
                      :quest-objective="objective"
                      :quest-interact="false"
                      :quest-id="objective.quests[0]"
                      class="ml-1"
                />
              </v-card>
            </v-menu>
          </template>
        </div>
      </v-col>
      <v-col 
        v-if="mapControls == true"
        class="ma-2"
        :align-self="fullscreen ? 'center' : 'start'"
      >
        <v-row
          no-gutters
          class="my-4"
        >
          <v-slider
            dense
            v-model="mapSize"
            max="100"
            min="50"
            label="Scale"
            color="secondary"
            class="mr-4"
            hide-details
          ></v-slider>
        </v-row>
        <v-row
          no-gutters
          class="my-4"
        >
          <v-col class="text-center">
            <v-btn-toggle
              v-model="layerSelect"
              mandatory
            >
              <v-btn
                v-for="floor in floors"
                :disabled="floors.length == 1"
                small
              >
                {{ floor.replace('_', ' ') }}
              </v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="my-4"
          v-for="floor in floors"
        >
          <v-col 
            cols="12" 
            class="text-h5"
          >
            {{ floor.replace('_', ' ') }} Objectives
          </v-col>
          <v-col 
            cols="12" 
            v-if="questObjectives.filter(o => hasFloor(o) && o.gps.floor == floor).length == 0"
            class="text-caption"
          >
            No objectives on this floor
          </v-col>
          <template
            v-for="objective in questObjectives.filter(o => hasFloor(o) && o.gps.floor == floor)"
          >
            <v-row
              no-gutters
              @mouseover="hoverIndex = objective.id; searchHover = true;"
              @mouseleave="hoverIndex = null; searchHover = null;"
            >
              <v-col
                cols="auto"
              >
                <v-icon>
                  {{ hoverIndex == objective.id ? 'mdi-map-marker-radius' : 'mdi-map-marker' }}
                </v-icon>
              </v-col>
              <v-col>
                <quest-objective
                  :quest-objective="objective"
                  :quest-interact="false"
                  :quest-id="objective.quests[0]"
                />
              </v-col>
            </v-row>
          </template>
        </v-row>
        <v-row
          v-if="fullscreen && questObjectives.filter(o => !hasFloor(o)).length > 0"
        >
          <v-col 
            cols="12" 
            class="text-h5"
          >
            Other Objectives
          </v-col>
          <template
            v-for="objective in questObjectives.filter(o => !hasFloor(o) && o.type !='key')"
          >
            <v-row
              no-gutters
              class="ml-4"
            >
              <v-col>
                <quest-objective
                  :quest-objective="objective"
                  :quest-interact="false"
                  :quest-id="objective.quests[0]"
                />
              </v-col>
            </v-row>
          </template>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
  export default {
    name: 'TarkovMap',

    data() {
      return {
        layerSelect: 0,
        hover: {},
        searchHover: null,
        hoverIndex: null,
        mapSizeOverride: null,
      }
    },

    props: {
      mapId: {
        type: Number,
      },
      mapControls: {
        type: Boolean,
      },
      fullscreen: {
        type: Boolean,
      },
      quests: {
        type: Array,
      }
    },

    mounted() {
      this.draw()
      document.getElementById(this.$id('svgmap')).addEventListener("click", function(event){
        var e = document.getElementById(this.$id('svgmap'));
        var dim = e.getBoundingClientRect();
        var x = event.clientX - dim.left;
        var y = event.clientY - dim.top;
        var pctX = (x / e.clientWidth * 100).toFixed(2)
        var pctY = (y / e.clientHeight * 100).toFixed(2)
        
        var gps = {
          leftPercent: parseFloat(pctX),
          topPercent: parseFloat(pctY),
          floor: this.floors[this.layerSelect]
        }
        console.log(gps);
        navigator.clipboard.writeText(JSON.stringify(gps, null, 4))
      }.bind(this));
    },

    watch: {
      layerSelect: function (newSelect, oldSelect) {
        this.draw()
      },
      mapId: function (newMap, oldMap) {
        this.draw()
      }
    },

    methods: {
      draw: function () {
        const d3 = require("d3");
        d3.svg(this.svgFile).then(function(xml) {
          d3.select(this.$idRef('svgmap')).selectAll("svg").remove()
          
          d3.select(this.$idRef('svgmap')).node().appendChild(xml.documentElement)
          this.floors.forEach((floor, index) => {
            if (index > this.layerSelect) {
              d3.select(this.$idRef('svgmap')).select("svg").select(`#${floor}`).style("opacity", 0.02)
            }
          }, this)
          d3.select(this.$idRef('svgmap')).select("svg")
        }.bind(this));
      },
      hasFloor: function (objective) {
        return 'gps' in objective && 'floor' in objective.gps
      }
    },

    computed: {
      mapSize: {
        get () {
          return this.mapSizeOverride || (this.fullscreen ? 100 : 75)
        },
        set (value) {
          this.mapSizeOverride = value
        },
      },
      svgFile: function () {
        return `/svg/${this.$root.mapDictionary[this.mapId].svg.file}`
      },
      floors: function () {
        return this.$root.mapDictionary[this.mapId].svg.floors
      },
      questObjectives: function() {
        // Get a flat list of unduplicated objectives from our quests
        const seen = new Set();
        return this.quests
          .reduce((acc, x) => acc.concat(x.objectives), [])
          .filter(objective => {
            const duplicate = seen.has(objective.id);
            seen.add(objective.id);
            return !duplicate;
          })
          .map(objective => ({ ...objective, quests: this.$root.objectiveDictionaryQuests[objective.id].quests}))
      },
      elMap: function () {
        // We need a unique element ID per map to make the d3 stuff not overlap
        return this._uid
      }
    },
  }
</script>
<style lang="sass">
.map-box
  max-height: 100vw

.objective-glow
  width: 10px
  height: 10px
  border-radius: 50%
  background-color: #000
  box-shadow: 0 0 10px 10px #000  /* inner white */
  opacity: 0.25
</style>