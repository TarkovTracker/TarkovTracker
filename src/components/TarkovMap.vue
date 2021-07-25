<template>
  <span>
    <div class="text-center" v-if="layerControls == true">
      <v-btn-toggle
        v-model="layerSelect"
        mandatory
      >
        <v-btn
          v-for="floor in floors"
        >
          {{ floor }}
        </v-btn>
      </v-btn-toggle>
    </div>
    <img :src="svgFile" class="map-box" />
  </span>
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
      //this.draw()
    },

    methods: {
      draw: function () {
        const d3 = require("d3");
        d3.svg(this.svgFile).then(function(xml) {
          d3.select("#tarkovMapSvg").node().appendChild(xml.documentElement);
        });
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