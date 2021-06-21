<template>
  <span v-if="format === 'minimal'">
    {{ item.name }}
  </span>
  <span v-else>
    <v-container fluid class="pa-0">
      <v-row no-gutters>
          <v-col align-self="center" justify="start" cols="auto" v-if="useImage">
            <v-img
              :src = "icon"
              :max-height = "imageSize"
              :max-width = "imageSize"
              contain
              class="item-icon item-block"
            >
            </v-img>
          </v-col>
          <v-col align-self="center" justify="start" cols="auto">
            <span class="align-self-center ml-2"><span v-if="count">{{ count }}x </span>{{ name }}
              <v-icon small class="icon-align" v-if="fir">
                mdi-checkbox-marked-circle-outline
              </v-icon>
            </span>
          </v-col>
      </v-row>
    </v-container>
  </span>
</template>

<script>

  export default {
    name: 'TarkovItem',

    props: {
      id: {
        type: String,
      },
      count: {
        type: Number,
        default: null,
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

      name: function () {
        return this.item ? this.item.name : this.id
      },

      icon: function() {
        return `/img/items/${this.id}.png`
      },

      // Use tooltip if we're full or details format
      useImage: function() {
        return this.format == 'full' || this.format == 'small'
      },

      imageSize: function () {
        if (this.format == 'full') {
          return '64px'
        }else{
          return '32px'
        }
      }
    },
  }
</script>
<style lang="sass">
.full-item
  width: 100%
.item-block
  display: inline-block
  vertical-align: middle
.item-icon
  float: left
</style>
