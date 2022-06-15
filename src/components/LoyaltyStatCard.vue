<template>
  <v-sheet
    elevation="6"
    class="px-2"
  >
    <v-row
      class="mt-6"
      no-gutters
    >
      <v-col
        cols="12"
        align="center"
      >
        <v-avatar
          class="mt-n10 ml-auto mr-auto elevation-6"
          size="80"
        >
          <img :src="avatar" />
        </v-avatar>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-1"
    >
      <v-col align="center" cols="12">
        {{ name }}
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-1"
    >
      <v-col align="center" cols="12">
        <span v-if="loyaltyLevel != null">
          <span v-if="loyaltyLevel === 4">
            Loyalty <v-icon class="objective-icon-bottom" small>mdi-crown</v-icon>
          </span>
          <span v-else>
            Loyalty {{romanLoyalty}}
          </span>
        </span>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-1"
    >
      <v-col align="center" cols="12" class="text-caption">
        <v-divider
          class="mb-2"
        ></v-divider>
        Reputation {{ reputation.toFixed(2) }}
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-1"
      v-if="nextLoyaltyRep > 0"
    >
      <v-col align="center" cols="12" class="text-caption">
        Next @ {{ nextLoyaltyRep.toFixed(2) }}
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script>
  export default {
    name: 'LoyaltyStatCard',

    props: {
      traderId: {
        type: Number
      },
      loyaltyLevel: {
        type: Number
      },
      reputation: {
        type: Number
      },
      nextLoyaltyRep: {
        type: Number
      }
    },

    computed: {
      avatar: function () {
        return this.traderIcon(this.traderId)
      },
      name: function () {
        return this.$root.traderDictionary[this.traderId].locale.en
      },
      romanLoyalty: function () {
        switch (this.loyaltyLevel) {
          case 1:
            return 'I'
          case 2:
            return 'II'
          case 3:
            return 'III'
          default:
            return this.loyaltyLevel
        }
      }
    }
  }
</script>
