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
          @click="incrementLevel()"
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
          @click="decrementLevel()"
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
        if(!this.$root.levelDataDefault[this.selfLevel]) {
          this.selfLevel = 71
        }
        return this.$root.levelDataDefault[this.selfLevel].group
      },

      groupIcon: function() {
        return `/img/LevelGroup${this.levelGroup}.png`
      },

      selfLevel: {
        get () {
          return this.$store.copy('progress/level')
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
      incrementLevel() {
        if(!this.$root.levelDataDefault[this.selfLevel + 1]) {
          this.selfLevel = 1
        } else {
          this.selfLevel += 1
        }
      },

      decrementLevel() {
        if(!this.$root.levelDataDefault[this.selfLevel - 1]) {
          this.selfLevel = Object.keys(this.$root.levelDataDefault).pop()
        } else {
          this.selfLevel -= 1
        }
      },
    },
  }
</script>
