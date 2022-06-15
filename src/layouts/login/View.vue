<template>
  <v-main>
      <div
        :class="[$vuetify.breakpoint.mdAndUp && 'fill-height']"
        class="d-block d-md-flex"
      >

        <router-view />

      </div>
  </v-main>
</template>

<script>
  // Utilities
  import { get } from 'vuex-pathify'

  export default {
    name: 'LoginView',

    data: () => ({}),

    computed: {
      path: get('route/path')
    }
  }
</script>
