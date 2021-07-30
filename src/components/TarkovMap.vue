<template>
  <v-container
    fluid
  >
    <v-row>
      <v-col
        cols="12"
        md="12"
        lg="9"
        xl="8"
      >
        <div id="tarkovsvgmap"
          class="mx-auto pa-0"
          v-bind:style="{ width: mapSize + '%', position: 'relative' }"
        >
          <template
            v-for="objective in questObjectives.filter(o => hasFloor(o) && o.gps.floor == floors[layerSelect])"
          >
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
                      class="ml-1"
                />
              </v-card>
            </v-menu>
          </template>
        </div>
      </v-col>
      <v-col v-if="layerControls == true && floors.length > 0">
        <v-row>
          <v-slider
            dense
            v-model="mapSize"
            max="100"
            min="50"
            label="Scale"
          ></v-slider>
        </v-row>
        <v-row>
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
        <v-row>
          <template v-for="floor in floors">
            <div class="text-h5">
              {{ floor.replace('_', ' ') }} Objectives
              <template
                v-for="objective in questObjectives.filter(o => hasFloor(o) && o.gps.floor == floor)"
              >
                <v-row
                  no-gutters
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
                    />
                  </v-col>
                </v-row>
              </template>
            </div>
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
        mapSize: 75,
        hover: {},
        hoverIndex: null,
      }
    },

    props: {
      mapId: {
        type: Number,
      },
      layerControls: {
        type: Boolean,
      },
      quests: {
        type: Array,
      }
    },

    mounted() {
      this.draw()
      document.getElementById('tarkovsvgmap').addEventListener("click", function(event){
        var e = document.getElementById('tarkovsvgmap');
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
          d3.select("#tarkovsvgmap").selectAll("svg").remove()
          
          d3.select("#tarkovsvgmap").node().appendChild(xml.documentElement)
          this.floors.forEach((floor, index) => {
            if (index > this.layerSelect) {
              d3.select("#tarkovsvgmap").select("svg").select(`#${floor}`).style("opacity", 0.02)
            }
          }, this)
          d3.select("#tarkovsvgmap").select("svg")
        }.bind(this));
      },
      hasFloor: function (objective) {
        return 'gps' in objective && 'floor' in objective.gps
      }
    },

    computed: {
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
      }
    },
  }
</script>
<style lang="sass">
.map-box
  max-height: 100vw
</style>