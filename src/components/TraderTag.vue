<template>
  <span>
    <v-container fluid class="pa-0">
      <v-row no-gutters>
        <v-col align-self="center" justify="start" cols="auto">
          <v-img :src="traderIcon(id)" max-height="32px" max-width="32px" contain
            class="item-icon item-block my-2 mr-2">
          </v-img>
        </v-col>
        <v-col align-self="center" justify="start" cols="auto">
          {{ trader.locale.en }}
          <span v-if="loyalty != null">
            <span v-if="loyalty === 4">
              Loyalty <v-icon class="objective-icon-bottom" small>mdi-crown</v-icon>
            </span>
            <span v-else>
              Loyalty {{ romanLoyalty }}
            </span>
          </span>
        </v-col>
      </v-row>
    </v-container>
  </span>
</template>

<script>
export default {
  name: 'TraderTag',

  props: {
    id: {
      type: Number,
    },
    loyalty: {
      type: Number,
      default: null,
    },
  },

  computed: {
    trader: function () {
      return this.$root.traderDictionary[this.id]
    },
    romanLoyalty: function () {
      switch (this.loyalty) {
        case 1:
          return "I"
        case 2:
          return "II"
        case 3:
          return "III"
        default:
          return this.loyalty
      }
    }
  },
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
