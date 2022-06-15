<template>
  <material-card
    icon="mdi-run"
    icon-small
    color="success lighten-1"
  >
    <template v-slot:title>
      {{ skillDetails.name }}
      <span class="skill-level">
        Level {{ skillDetails.number }}
      </span>
    </template>

    <template v-slot:actions>
      <div class="text-left">
        <span v-if="skillDetails.unlocked">
          <v-icon>lock_open</v-icon>{{ skillDetails.unlocked }} before
        </span>
        <span v-if="skillDetails.type === 'quest'">
          <quest-link :quest-id="skillDetails.questId" />
          <span v-if="skillDetails.nokappa">
            <v-chip
              class="ma-1 font-weight-bold"
              x-small
              color="error"
            >
              NOT KAPPA
            </v-chip>
          </span>
        </span>
        <span v-if="skillDetails.type === 'hideout'">
          <span style="font-weight:bold">
            {{ skillDetails.for }} Level {{ skillDetails.forLevel }}
          </span>
        </span>
        <div class="info-link">
          <a
            :href="'https://escapefromtarkov.gamepedia.com/'+skillDetails.name"
            target="_blank"
          >
            <v-icon>info</v-icon>Wiki page</a>
        </div>
      </div>
    </template>
  </material-card>
</template>
<script>
  export default {
    name: 'SkillCard',
    props: {
      skillDetails: Object
    },
    data () {
      return {
      }
    },
    methods: {
    }
  }
</script>
<style lang="sass">
.skill-level
  font-size: .8rem !important
  margin-left: auto
  font-weight: bold
.info-link a
  text-decoration: none
  color: var(--v-questlink-base) !important
  font-weight: normal
</style>
