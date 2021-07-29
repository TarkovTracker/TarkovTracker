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
        <div class="map-box" id="tarkovsvgmap" />
      </v-col>
      <v-col class="text-center" v-if="layerControls == true && floors.length > 0">
        <v-btn-toggle
          v-model="layerSelect"
          mandatory
        >
          <v-btn
            v-for="floor in floors"
          >
            {{ floor.replace('_', ' ') }}
          </v-btn>
        </v-btn-toggle>
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
      }
    },

    props: {
      mapId: {
        type: Number,
      },
      layerControls: {
        type: Boolean,
      }
    },

    mounted() {
      this.draw()
    },

    watch: {
      layerSelect: function (newSelect, oldSelect) {
        this.draw()
      }
    },

    methods: {
      draw: function () {
        const d3 = require("d3");
        d3.svg(this.svgFile).then(function(xml) {
          d3.select("#tarkovsvgmap").select("svg").remove()
          d3.select("#tarkovsvgmap").node().appendChild(xml.documentElement)
          this.floors.forEach((floor, index) => {
            if (index > this.layerSelect) {
              d3.select("#tarkovsvgmap").select("svg").select(`#${floor}`).remove()
            }
          }, this)
          d3.select("#tarkovsvgmap").select("svg")
        }.bind(this));
      }
    },

    computed: {
      svgFile: function () {
        return `/svg/${this.$root.mapDictionary[this.mapId].svg.file}`
      },
      floors: function () {
        return this.$root.mapDictionary[this.mapId].svg.floors
      },
    },
  }
</script>
<style lang="sass">
.map-box
  max-height: 100vw
</style>