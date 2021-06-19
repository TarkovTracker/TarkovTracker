<template>
  <v-col
    class="text-center"
    cols="12"
    style="font-size: .7rem"
  >
    <div>
      Game content and materials are trademarks and copyrights of Battlestate Games and its licensors. All rights reserved.
    </div>
    <div>
      &copy; 2020 - {{ new Date().getFullYear() }}, Apologist and the <router-link
        :to="{ path: '/contributors' }"
        class="info-link"
      >
        TarkovTracker contributors.
      </router-link> Report bugs/request features on the <a
        href="https://discord.gg/zeAP4Ng"
        target="_blank"
        class="info-link"
      >discord server.</a> Tracker Version: <a
        :href="trackerSourceLink"
        target="_blank"
        class="info-link"
      >{{ $root.$data.overallVersion }}</a> Data: <a
        :href="tarkovDataLink"
        target="_blank"
        class="info-link"
      >{{ $root.$data.dataHash.substring(0, 7) }}</a>
    </div>
    <div>
      <a
        href="https://www.patreon.com/apologist"
        target="_blank"
        class="info-link"
      >Help keep the project going on Patreon!</a> | <router-link
        to="/terms"
        target="_blank"
        class="info-link"
      >Terms</router-link> | <router-link
        to="/privacy"
        target="_blank"
        class="info-link"
      >Privacy</router-link>
    </div>
  </v-col>
</template>
<script>
  export default {
    name: 'SharedFooter',
    computed: {
      tarkovDataLink: function () {
        return `https://github.com/TarkovTracker/tarkovdata/tree/${this.$root.$data.dataHash}`
      },
      trackerSourceLink: function () {
        return `https://github.com/TarkovTracker/TarkovTracker/tree/${this.$root.$data.overallVersion}`
      },
    },
  }
</script>
