<template>
  <div>
    <span v-show="currentHint != ''">
      {{ $t('hint') }}: {{ currentHint }}
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
          this.$t('hints.skip_to_your_current_quests'),
          this.$t('hints.use_the_maps_page'),
          this.$t('hints.choose_what_items_to_keep_or_sell'),
          this.$t('hints.use_the_locked_behind_quest_count'),
          this.$t('hints.check_the_skills_page'),
          this.$t('hints.we_all_have_bad_days'),
          this.$t('hints.learn_jaeger_stash_locations'),
          this.$t('hints.scav_case_is_a_great_source'),
          this.$t('hints.hideout_produced_items_count'),
          this.$t('hints.using_headphones_makes_a_difference'),
          this.$t('hints.some_barter_under_market_price'),
          this.$t('hints.good_ammo'),
          this.$t('hints.click_an_objective_of_a_quest'),
          this.$t('hints.advanced_controls'),
          this.$t('hints.playing_with_others'),
          this.$t('hints.save_weapon_parts'),
          this.$t('hints.submit_feature_requests'),
        ],
      }
    },
    mounted () {
      this.randomizeHint()
      this.$router.afterEach((to, from) => {
        this.randomizeHint()
      })
    },
    methods: {
      randomizeHint () {
        this.currentHint = this.hintList[Math.floor(Math.random() * this.hintList.length)]
      },
    },
  }
</script>
