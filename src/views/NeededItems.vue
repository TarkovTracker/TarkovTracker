<template>
  <keep-alive>
    <v-container
      id="tabs-view"
      fluid
      tag="section"
    >
      <v-responsive
        max-width="1200"
        class="mx-auto"
      >
        <div class="text-center my-10">
          <collect-table
            table-header-color="green"
          />
        </div>
      </v-responsive>
    </v-container>
  </keep-alive>
</template>

<script>
  export default {
    name: 'TabsView',

    data: () => ({
      neededItemsTabs: [
        {
          text: 'All',
          icon: 'mdi-all-inclusive',
          target: ['find', 'collect', 'hideout'],
        },
        {
          text: 'Find In Raid',
          icon: 'mdi-checkbox-marked-circle-outline',
          target: ['find'],
        },
        {
          text: 'Handover',
          icon: 'mdi-close-circle-outline',
          target: ['collect'],
        },
        {
          text: 'Hideout',
          icon: 'mdi-home',
          target: ['hideout'],
        },
      ],
    }),
    metaInfo: {
      // Children can override the title.
      title: 'Needed Items',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'See all the items you will need to collect to complete your quests and upgrade your hideout.' },
      ],
    },
  }
</script>
