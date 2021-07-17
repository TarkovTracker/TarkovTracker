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
          v-if="avatar"
          v-bind="attrs"
          v-on="on"
        >
          <v-avatar
            :color="stringToColour(name)"
            size="25"
          >
            {{ name | initials}}
          </v-avatar>
        </span>
        <span
          v-else
          class="underline"
          v-bind="attrs"
          v-on="on"
        >
          {{ name || teammate.id }}
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
        type: Object,
      },
      left: {
        type: Boolean,
        default: false,
      },
      avatar: {
        type: Boolean,
        default: true,
      },
    },

    computed: {
      name() {
        return this.teammate.self ? this.$store.copy('progress/shareName') || 'Yourself' : this.teammate.store.copy('progress/shareName') || this.teammate.name || this.teammate.id
      }
    },
    methods: {
      stringToColour (str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
          var value = (hash >> (i * 8)) & 0xFF;
          colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
      }
    },
    filters: {
      initials: function (value) {
        if (!value) return ''
        value = value.toString()
        return value.substring(0,2)
      }
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
