<template>
  <material-card
    v-bind="$attrs"
    class="v-card--material-chart"
  >
    <template #heading>
      <div class="pa-4">
        <chartist
          :data="data"
          :event-handlers="eventHandlers"
          :options="options"
          :ratio="ratio"
          :responsive-options="responsiveOptions"
          :type="type"
          style="max-height: 150px;"
        />
      </div>
    </template>

    <template #subtitle>
      <slot name="subtitle" />
    </template>

    <template #actions>
      <slot name="actions" />
    </template>

  </material-card>
</template>

<script>
  export default {
    name: 'MaterialChartCard',

    inheritAttrs: false,

    props: {
      data: {
        type: Object,
        default: () => ({}),
      },
      eventHandlers: {
        type: Array,
        default: () => ([]),
      },
      options: {
        type: Object,
        default: () => ({}),
      },
      ratio: String,
      responsiveOptions: {
        type: Array,
        default: () => ([]),
      },
      type: {
        type: String,
        required: true,
        validator: v => ['Bar', 'Line', 'Pie'].includes(v),
      },
    },
  }
</script>

<style lang="sass">
  .v-card--material-chart
    .v-card__title
      border: 1px solid var(--v-accent-darken2)
    p
      color: var(--v-secondary-base)

    .v-card--material__sheet
      border: 1px solid var(--v-accent-darken2)
      max-height: 185px
      width: 100%

      .ct-label
        color: var(--v-questlink-base)
        opacity: .7
        font-size: 0.875rem
        font-weight: 300

      .ct-grid
        stroke: var(--v-secondary-base)

      .ct-series-a .ct-point,
      .ct-series-a .ct-line,
      .ct-series-a .ct-bar,
      .ct-series-a .ct-slice-donut
        stroke: var(--v-accent-base)

      .ct-series-a .ct-slice-pie,
      .ct-series-a .ct-area
        fill: var(--v-secondary-base)

      .ct-series-b .ct-bar
        stroke: var(--v-chartbase-base)
</style>
