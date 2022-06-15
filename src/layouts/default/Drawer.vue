<template>
  <v-navigation-drawer
    id="default-drawer"
    v-model="drawer"
    :dark="true"
    :right="$vuetify.rtl"
    src="/img/tarkov-tracker-sidebar-01.jpg"
    :mini-variant="miniOverride || mini"
    mini-variant-width="80"
    style="background-position: 42% 100%;"
    app
    width="260"
  >
    <template
      #img="props"
    >
      <v-img
        v-bind="props"
      />
    </template>

    <div class="px-2">
      <default-drawer-header />

      <v-divider class="mx-3" />

      <user-list />

      <v-divider class="mx-3 mb-2" />

      <player-level />

      <v-divider class="mx-3 mb-2" />

      <default-list :items="items" />

      <v-divider class="mx-3 mb-2" />

      <default-list :items="communityItems" />
    </div>

    <template #append>
      <div class="pa-4 text-center" />
    </template>

    <div class="pt-12" />
  </v-navigation-drawer>
</template>

<script>
  // Utilities
  import { get, sync } from 'vuex-pathify'

  export default {
    name: 'DefaultDrawer',

    components: {
      UserList: () => import(
        './widgets/UserList'
      ),
      PlayerLevel: () => import(
        './widgets/PlayerLevel'
      ),
      DefaultDrawerHeader: () => import(
        /* webpackChunkName: "default-drawer-header" */
        './widgets/DrawerHeader'
      ),
      DefaultList: () => import(
        /* webpackChunkName: "default-list" */
        './List'
      ),
    },

    data () {
      return {
        items: [
          {
            title: 'Overview',
            icon: 'mdi-view-dashboard',
            to: '/',
          },
          {
            title: 'Quests',
            icon: 'mdi-clipboard-check',
            to: '/quests',
          },
          {
            title: 'Needed Items',
            icon: 'mdi-clipboard-text',
            to: '/gather',
          },
          {
            title: 'Hideout',
            icon: 'mdi-home',
            to: '/hideout',
          },
          {
            title: 'Skills',
            icon: 'mdi-run',
            to: '/skills',
          },
          {
            title: 'Contributors',
            icon: 'mdi-glass-mug-variant',
            to: '/contributors',
          },
          {
            title: 'Settings',
            icon: 'mdi-cogs',
            to: '/settings',
          },
        ],
        communityItems: [
          {
            title: 'Community',
            icon: 'mdi-account-group',
            items: [
              {
                title: 'Tarkov Tools',
                image: '/img/tarkovtoolslogo.png',
                href: 'http://tarkov-tools.com',
                noradius: true,
              },
              {
                title: 'Rat Scanner',
                image: '/img/ratscannerlogo.png',
                href: 'https://github.com/RatScanner/RatScanner/',
                noradius: true,
              },
              {
                title: 'Tarkov Guru',
                image: '/img/tarkovgurulogo.png',
                href: 'https://tarkov.guru/',
                noradius: true,
              },
            ],
          },
        ],
      }
    },

    mounted () {
      // if (this.myselfQuestAvailable(this.questDictionary['Collector']) === 0) {
      //   this.items[3].items.push({title: 'Fence', to: '/trader/fence', image: '/img/FenceHeadshot.jpg'})
      // }
    },

    props: {
      miniOverride: Boolean,
    },

    computed: {
      ...sync('app', [
        'mini',
        'dark',
        'drawer',
      ]),
    },
  }
</script>

<style lang="sass">
#default-drawer
  .v-list-item
    margin-bottom: 8px

  .v-list-item::before,
  .v-list-item::after
    display: none

  .v-list-group__header__prepend-icon,
  .v-list-item__icon
    margin-top: 12px
    margin-bottom: 12px
    margin-left: 4px

  &.v-navigation-drawer--mini-variant
    .v-list-item
      justify-content: flex-start !important
</style>
