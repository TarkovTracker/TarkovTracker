<template>
  <v-container
    id="error-view"
    class="fill-height text-center"
    tag="section"
  >
    <v-row justify="center">
      <v-col cols="auto">
        <h1 class="text-h1 mb-16 font-weight-bold">
          404
        </h1>

        <div class="text-h4 pt-8 pb-10">
          Page not found :(
        </div>

        <v-btn
          depressed
          large
          to="/"
        >
          Get me out of here!
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default { name: 'ErrorView' }
</script>

<style lang="sass">
  #error-view h1.text-h1
    font-size: 14rem !important
</style>
