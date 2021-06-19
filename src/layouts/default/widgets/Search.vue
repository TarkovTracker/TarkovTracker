<template>
  <v-autocomplete
    v-model="selected"
    :items="searchList"
    item-text="name"
    label="Search"
    style="max-width:300px"
    @keydown.enter="searchSite"
  >
    <template
      v-if="$vuetify.breakpoint.mdAndUp"
      v-slot:append-outer
    >
      <v-btn
        class="mt-n2 ml-n2"
        fab
        small
        elevation="2"
        height="44"
        width="44"
        @click="searchSite"
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </template>
  </v-autocomplete>
</template>

<script>
  export default {
    name: 'DefaultSearch',
    data () {
      return {
        selected: null,
      }
    },
    computed: {
      searchList: function () {
        var searchList = ['Prapor', 'Therapist', 'Skier', 'Peacekeeper', 'Mechanic', 'Ragman', 'Jaeger', 'Factory', 'Customs', 'Woods', 'Shoreline', 'Interchange', 'Reserve', 'Labs']
        var tempQuests = this.$root.questArray
        for (var i = 0; i < tempQuests.length; i++) {
          searchList.push(tempQuests[i].title)
        }
        return searchList
      },
    },
    watch: {
    },
    methods: {
      searchSite () {
        if (['Prapor', 'Therapist', 'Skier', 'Peacekeeper', 'Mechanic', 'Ragman', 'Jaeger'].includes(this.selected)) {
          this.$router.push({ name: 'Trader', params: { traderName: this.selected.toLowerCase() } })
        } else if (['Factory', 'Customs', 'Woods', 'Shoreline', 'Interchange', 'Reserve', 'Labs'].includes(this.selected)) {
          this.$router.push({ name: 'Map', params: { mapName: this.selected.toLowerCase() } })
        } else {
          if (this.$root.questDictionary[this.selected] != null) {
            this.$router.push({ name: 'Quest', params: { id: this.$root.questDictionary[this.selected].id } })
          }
        }
        this.selected = null
      },
    },
  }
</script>
