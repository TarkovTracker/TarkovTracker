<template>
  <v-container
    id="login-view"
    class="fill-height"
    tag="section"
  >
    <v-row justify="center">
      <v-col cols="12">
        <v-slide-y-transition appear>
          <firebase-auth />
        </v-slide-y-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'LoginView',

    data: () => ({

    })
  }
</script>
