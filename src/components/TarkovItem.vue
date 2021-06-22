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
            class="item-icon item-block my-2 mr-2"
          >
          </v-img>
        </v-col>
        <v-hover v-slot="{ hover }">
          <v-col align-self="center" justify="start" cols="auto">
            <v-badge
              avatar
              inline
              :value="toolsLink && hover"
            >
              <template v-slot:badge>
                <v-avatar @click="visitToolsLink()" title="Show item details on Tarkov Tools" class="tools-link">
                  <v-img src="/img/tarkovtoolslogo.png"></v-img>
                </v-avatar>
              </template>
              <span class="align-self-center"><span v-if="count">{{ count }}x </span>{{ name }}
                <v-icon small class="icon-align" v-if="fir" title="Found in Raid status required">
                  mdi-checkbox-marked-circle-outline
                </v-icon>
              </span>
            </v-badge>
          </v-col>
        </v-hover>
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
      },
      toolsLink: {
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
        return `https://assets.tarkov-tools.com/${this.id}-icon.jpg`
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

    methods: {
      visitToolsLink () {
        window.open(`https://tarkov-tools.com/item/${this.id}`, "_blank");
      },
    },
  }
</script>
<style lang="sass">
.tools-link
  cursor: pointer
.full-item
  width: 100%
.item-block
  display: inline-block
  vertical-align: middle
.item-icon
  float: left
  border: 1px solid var(--v-accent-base)
</style>
