<template>
  <router-link
    class="quest-link"
    :to="{ name: 'Quests', params: { viewType: 'traders', subView: trader.locale.en }}"
  >
    <img
      class="img"
      :src="traderIcon(trader.locale.en)"
      style="height:1.5em;width:auto;border-radius:50%;margin:3px;vertical-align:middle;"
    >
    {{ trader.locale.en }}
  </router-link>
</template>

<script>
  export default {
    name: 'TraderLink',

    props: {
      id: {
        type: Number,
      },
    },

    computed: {
      trader: function () {
        return this.$root.traderDictionary[this.id]
      },
    },
  }
</script>
