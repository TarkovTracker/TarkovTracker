<template>
  <app-card
    v-bind="$attrs"
    class="v-card--material mt-4"
  >
    <v-card-title class="align-start">
      <v-sheet
        :color="color"
        :width="_headerWidth"
        class="overflow-hidden mt-n9 transition-swing v-card--material__sheet"
        elevation="6"
        max-width="100%"
        rounded
      >
        <v-theme-provider dark>
          <div
            v-if="icon"
            :class="iconSmall ? 'pa-5' : 'pa-6'"
          >
            <v-icon
              :large="!iconSmall"
              v-text="icon"
            />
          </div>
          <div v-if="$slots.heading">
            <slot name="heading" />
          </div>
          <div
            v-if="heading"
            class="text-h4 white--text pa-4 v-card--material__title"
          >
            {{ title }}
          </div>
        </v-theme-provider>
      </v-sheet>

      <v-sheet
        v-if="$slots.secondaryHeading"
        :color="accentColor"
        :width="_headerWidth"
        class="overflow-hidden mt-3  v-card--material__sheet"
        elevation="6"
        max-width="100%"
        rounded
      >
        <v-theme-provider dark>
          <div v-if="$slots.secondaryHeading">
            Test
            <slot name="secondaryHeading" />
          </div>
        </v-theme-provider>
      </v-sheet>

      <div
        v-if="hasTitle"
        class="text-h4 pl-4 v-card--material__title"
      >
        <slot name="title" />

        <template v-if="title">
          {{ title }}
        </template>

        <div class="text-subtitle-1">
          <slot
            v-if="$slots.subtitle"
            name="subtitle"
          />

          <div
            v-else-if="subtitle"

            v-text="subtitle"
          />
        </div>
      </div>
    </v-card-title>

    <slot />

    <template v-if="$slots.actions">
      <v-divider class="mt-2 mx-4" />

      <v-card-actions class="px-4 text-caption grey--text">
        <slot name="actions" />
      </v-card-actions>
    </template>
  </app-card>
</template>

<script>
  export default {
    name: 'MaterialCard',

    props: {
      heading: String,
      color: String,
      accentColor: String,
      fullHeader: Boolean,
      headerWidth: String,
      icon: String,
      iconSmall: Boolean,
      subtitle: String,
      title: String
    },

    computed: {
      _headerWidth () {
        if (this.fullHeader) {
          return '100%'
        } else if (this.headerWidth) {
          return this.headerWidth
        } else {
          return undefined
        }
      },
      hasTitle () {
        return (
          this.title ||
          this.subtitle ||
          this.$slots.title ||
          this.$slots.subtitle
        )
      }
    }
  }
</script>
