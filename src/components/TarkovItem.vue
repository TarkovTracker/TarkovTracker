<template>
  <span v-if="format === 'minimal'">{{ name }}</span>
  <span v-else>
    <v-container fluid class="pa-0">
      <v-hover v-slot="{ hover }">
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

          <v-col align-self="center" justify="start" cols="auto">
              <span class="align-self-center"><span v-if="count">{{ count.toLocaleString() }} </span>{{ name }}
                <v-icon small class="icon-align" v-if="fir" title="Found in Raid status required">
                  mdi-checkbox-marked-circle-outline
                </v-icon>
              </span>
              <v-avatar @click="visitToolsLink()" title="Show item on Tarkov.dev" class="external-link ml-1" v-if="(externalLinks && hover) || linksForce" size="1.25em">
                <v-img src="/img/tarkovdevlogo.png"></v-img>
              </v-avatar>
              <v-avatar @click="visitWikiLink()" title="Show item on EFT Wiki" class="external-link  ml-1" v-if="(externalLinks && hover) || linksForce" size="1.25em">
                <v-img src="/img/wikilogo.png"></v-img>
              </v-avatar>
          </v-col>
        </v-row>
      </v-hover>
    </v-container>
  </span>
</template>

<script>

  export default {
    name: 'TarkovItem',

    props: {
      id: {
        type: String
      },
      count: {
        type: Number,
        default: null
      },
      format: {
        type: String,
        default: 'full'
      },
      fir: {
        type: Boolean,
        default: false
      },
      externalLinks: {
        type: Boolean,
        default: false
      },
      linksForce: {
        type: Boolean,
        default: false
      }
    },

    computed: {
      item: function () {
        return this.$root.itemDictionary[this.id]
      },

      name: function () {
        return this.item ? this.item.name : this.id
      },

      icon: function () {
        return `https://assets.tarkov.dev/${this.id}-icon.jpg`
      },

      // Use tooltip if we're full or details format
      useImage: function () {
        return this.format == 'full' || this.format == 'small'
      },

      imageSize: function () {
        if (this.format == 'full') {
          return '64px'
        } else {
          return '32px'
        }
      }
    },

    methods: {
      visitToolsLink () {
        window.open(`https://tarkov.dev/item/${this.id}`, '_blank')
      },
      visitWikiLink () {
        window.open(`https://escapefromtarkov.fandom.com/wiki/${this.name}`, '_blank')
      }
    }
  }
</script>
<style lang="sass">
.external-link
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
