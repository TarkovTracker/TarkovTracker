<template>
  <v-tooltip top>
    <template v-slot:activator="{ on, attrs }">
      <v-badge
        icon="mdi-account-convert"
        :value="teammate.dynamic == true"
        color="objectiveenough"
        :left="left"
      >
        <span
          class="underline"
          v-bind="attrs"
          v-on="on"
        >
          {{ teammate.self ? $store.copy('progress/shareName') || 'Yourself' : teammate.store.copy('progress/shareName') || teammate.name || teammate.id }}
        </span>
      </v-badge>
    </template>
    <span>Unique ID: {{ teammate.id }}<span v-if="teammate.self"> (That's you!)</span></span>
  </v-tooltip>
</template>

<script>
  export default {
    name: 'TeammateIdentity',

    props: {
      teammate: {
        type: Object
      },
      left: {
        type: Boolean,
        default: false
      }
    },

    computed: {
    }
  }
</script>
<style lang="sass">
.underline
  text-underline-offset: 3px
  text-decoration-line: underline
  text-decoration-style: dashed
  text-decoration-thickness: 2px
  text-decoration-color: var(--v-objectiveenough-lighten2)
</style>
