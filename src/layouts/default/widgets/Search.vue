<template>
  <v-autocomplete
    v-model="selected"
    :items="searchList"
    item-text="name"
    label="Search"
    style="max-width:300px"
    @keydown.enter="searchSite"
    @change="searchSite"
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
        selected: null
      }
    },
    computed: {
      searchList: function () {
        const searchList = []
        const tempQuests = this.$root.questArray
        for (let i = 0; i < tempQuests.length; i++) {
          searchList.push(tempQuests[i].title)
        }
        return searchList
      }
    },
    watch: {
    },
    methods: {
      searchSite () {
        if (this.$root.questDictionary[this.selected] != null) {
          this.$router.push({ name: 'Quest', params: { id: this.$root.questDictionary[this.selected].id } })
        }
        this.selected = null
      }
    }
  }
</script>
