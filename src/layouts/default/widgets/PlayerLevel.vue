<template>
  <div class="d-flex justify-center align-center mb-2">
    <span style="line-height:0px" v-if="!mini">
      <img
        :src="groupIcon"
        contain
        style="max-width:64px"
      >
    </span>
    <span>
      <div style="font-size:.7em" class="text-center mb-1">
        Level
      </div>
      <div class="text-center">
        <h1 style="font-size:2.5em; line-height:0.8em;">
          {{ selfLevel }}
        </h1>
      </div>
    </span>
    <span v-if="!mini">
      <div>
        <v-btn
          icon
          small
          @click="changeLevel(1)"
        >
          <v-icon class="ma-0">
            mdi-chevron-up
          </v-icon>
        </v-btn>
      </div>
      <div>
        <v-btn
          icon
          small
          @click="changeLevel(-1)"
        >
          <v-icon class="ma-0">
            mdi-chevron-down
          </v-icon>
        </v-btn>
      </div>
    </span>
  </div>
</template>

<script>
  import { get, sync } from 'vuex-pathify'
  export default {
    name: 'PlayerLevel',

    components: {
    },

    data: () => ({
    }),

    computed: {
      levelGroup: function () {
        return this.$root.levelDataDefault[this.selfLevel].group
      },

      groupIcon: function() {
        return `/img/LevelGroup${this.levelGroup}.png`
      },

      selfLevel: {
        get () {
          return this.$store.copy('progress/level') || 71
        },
        set (value) {
          this.$store.set('progress/level', value)
        },
      },

      ...sync('app', [
        'mini',
      ]),
    },

    methods: {
      changeLevel(change) {
        this.selfLevel += change
      }
    },
  }
</script>
