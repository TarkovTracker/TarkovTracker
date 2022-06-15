// Imports
import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import { trailingSlash } from '@/util/helpers'
import {
  layout,
  route
} from '@/util/routes'

import Trader from '@/views/Trader.vue'
import TraderQuestTable from '@/views/TraderQuestTable.vue'

import Maps from '@/views/Maps.vue'
import MapsQuestTable from '@/views/MapsQuestTable.vue'

import AllQuests from '@/views/AllQuests.vue'

import Hideout from '@/views/Hideout.vue'
import HideoutTable from '@/views/HideoutTable.vue'

import QuestInfo from '@/views/QuestInfo.vue'

Vue.use(Router)
Vue.use(Meta)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: (to, from, savedPosition) => {
    if (to.hash) return { selector: to.hash }
    if (savedPosition) return savedPosition

    return { x: 0, y: 0 }
  },
  routes: [
    layout('Default', [
      route('Dashboard'),

      // TarkovTracker Pages
      // route('Overview', null, 'overview'),
      route('Needed Items', null, 'gather'),
      route('Settings', null, 'settings'),
      { path: '/trader', redirect: '/trader/prapor' },
      { path: '/trader/:traderName', redirect: '/trader/:traderName/available' },
      {
        name: 'Trader',
        path: '/trader/:traderName',
        component: Trader,
        props: true,
        children: [
          {
            path: '/trader/:traderName/:availability',
            component: TraderQuestTable
          }
        ]
      },
      { path: '/maps', redirect: '/maps/factory' },
      {
        name: 'Maps',
        path: '/maps',
        component: Maps,
        props: true,
        children: [
          {
            name: 'Map',
            path: '/maps/:mapName',
            component: MapsQuestTable
          }
        ]
      },
      {
        name: 'Quests',
        path: '/quests',
        component: AllQuests,
        props: true
      },
      { path: '/hideout', redirect: '/hideout/available' },
      {
        path: '/hideout',
        component: Hideout,
        props: true,
        children: [
          {
            path: '/hideout/:availability',
            component: HideoutTable
          }
        ]
      },
      route('Skills', null, 'skills'),
      {
        name: 'Quest',
        path: '/quest/:id',
        component: QuestInfo,
        props: true
      },
      route('Contributors', null, 'contributors'),
      // Pages
      route('Timeline', null, 'components/timeline'),
      route('UserProfile', null, 'components/profile')

    ]),
    layout('Login', [
      route('Error', null, 'error'),
      // route('Lock', null, 'lock'),
      route('Login', null, 'login')
      // route('Pricing', null, 'pricing'),
      // route('Register', null, 'register'),
    ])
  ]
})

router.beforeEach((to, from, next) => {
  return to.path.endsWith('/') ? next() : next(trailingSlash(to.path))
})

export default router
