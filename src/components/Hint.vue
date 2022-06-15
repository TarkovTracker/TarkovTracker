<template>
  <div>
    <span v-show="currentHint != ''">
      Hint: {{ currentHint }}
    </span>
  </div>
</template>

<script>
  export default {
    name: 'TrackerHint',
    data () {
      return {
        currentHint: '',
        hintList: [
          "Skip to your current quests in the Trader's locked tabs",
          'Use the Maps page to plan multiple quest objectives at once',
          'Choose what items to keep or sell with the Needed Items page',
          'Use the locked behind quest count to help prioritize long quest chains',
          'Check the skills page to see what you need to be working on in raids',
          'We all have bad days of Tarkov. Take a break, sleep it off.',
          'Learn Jaeger stash locations to help fund your progression',
          'Scav Case is a great source of Kappa items',
          'Hideout produced items count as Found In Raid (FIR)',
          'Using headphones (in-game, and irl) makes a world of difference',
          'Some barter trades can get you useful gear pieces under market price',
          'Good ammo is usually worth the investment',
          'You can click an objective of a quest to mark it complete',
          'Learn & customize the advanced controls for Tarkov',
          'Playing with others can help make the game less brutal',
          "Save weapon parts you like even if you don't keep the weapon",
          'You can submit feature requests on the TarkovTracker discord'
        ]
      }
    },
    mounted () {
      this.randomizeHint()
      this.$router.afterEach(() => {
        this.randomizeHint()
      })
    },
    methods: {
      randomizeHint () {
        this.currentHint = this.hintList[Math.floor(Math.random() * this.hintList.length)]
      }
    }
  }
</script>
