<template>
  <span v-if="tooltip">
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
          <span
            v-bind="attrs"
            v-on="on"
          >
            <div v-if="format === 'full'" class="d-flex">
              <v-img
                :src = "icon"
                max-height = "64px"
                max-width = "64px"
                contain
              >
                
              </v-img>
              <div class="align-self-center ml-2">{{ item.name }}
                <v-icon small class="icon-align" v-if="fir">
                  mdi-checkbox-marked-circle-outline
                </v-icon>
              </div>
            </div>
            <div v-else>
              {{ item.name }}
              <v-icon small class="icon-align" v-if="fir">
                mdi-checkbox-marked-circle-outline
              </v-icon>
            </div>
          </span>
      </template>
      <span>Short name: {{ item.shortName }}</span>
    </v-tooltip>
  </span>
  <span v-else>
    {{ item.name }}
  </span>
</template>

<script>

  export default {
    name: 'TarkovItem',

    props: {
      id: {
        type: String,
      },
      format: {
        type: String,
        default: "full",
      },
      fir: {
        type: Boolean,
        default: false,
      }
    },

    computed: {
      item: function () {
        return this.$root.itemDictionary[this.id]
      },

      icon: function() {
        return `/img/items/${this.id}.png`
      },

      // Use tooltip if we're full or details format
      tooltip: function() {
        return this.format == 'full' || this.format == 'details'
      }
    },
  }
</script>
<style lang="sass">
.item-icon
  float: left
</style>
