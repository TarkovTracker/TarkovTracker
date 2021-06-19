<template>
  <router-link
    class="quest-link"
    :to="{ name: 'Quest', params: { id: quest.id }}"
  >
    <img
      class="img"
      :src="traderIcon(quest.giver)"
      style="height:1.5em;width:auto;border-radius:50%;margin:3px;vertical-align:middle;"
    >
    {{ quest.title }}
  </router-link>
</template>

<script>
  export default {
    name: 'QuestLink',

    props: {
      questId: {
        type: Number,
      },
    },

    computed: {
      quest: function () {
        return this.$root.questDictionaryId[this.questId]
      },
    },
  }
</script>
