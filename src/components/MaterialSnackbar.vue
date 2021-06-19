<template>
  <v-snackbar
    v-model="internalValue"
    class="v-snackbar--material"
    v-bind="{
      ...$attrs,
      'color': 'transparent'
    }"
  >
    <material-alert
      v-model="internalValue"
      :color="$attrs.color"
      :dismissible="dismissible"
      :type="type"
      :icon="$attrs.icon"
      class="ma-0"
      dark
      v-bind="$attrs"
    >
      <slot />
    </material-alert>
  </v-snackbar>
</template>

<script>
  export default {
    name: 'MaterialSnackbar',

    props: {
      dismissible: {
        type: Boolean,
        default: true,
      },
      type: {
        type: String,
        default: '',
      },
      value: Boolean,
    },

    data () {
      return {
        internalValue: this.value,
      }
    },

    watch: {
      internalValue (val, oldVal) {
        if (val === oldVal) return

        this.$emit('input', val)
      },
      value (val, oldVal) {
        if (val === oldVal) return

        this.internalValue = val
      },
    },
  }
</script>

<style lang="sass">
  .v-snackbar--material
    margin-top: 32px
    margin-bottom: 32px

    .v-alert
      padding: 32px 16px

    .v-alert--material,
    .v-snack__wrapper
      border-radius: 4px

    .v-snack__content
      overflow: visible
      padding: 0

    .v-snack__action
      display: none
</style>
