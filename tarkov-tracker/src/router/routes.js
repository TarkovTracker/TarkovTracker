const routes = [
  {
    // Standard Layout
    path: '',
    component: () => import("@/components/layout/StandardLayout.vue"),
    children: [
      {
        // Default route
        name: 'dashboard',
        path: '',
        alias: ['/', '/dashboard'],
        meta: { background: 'sunset' },
        component: () => import("@/pages/TrackerDashboard.vue"),
      },
      {
        path: "/test",
        component: () => import("@/pages/TrackerDashboard.vue"),
      },
      {
        name: 'settings',
        path: "/settings",
        meta: { background: 'gas' },
        component: () => import("@/pages/TrackerSettings.vue"),
      },
      { 
        path: '/:pathMatch(.*)*', 
        name: 'not-found', 
        component: () => import("@/pages/NotFound.vue") 
      },
      {
        name: 'login',
        path: "/login",
        meta: { background: 'checkpoint' },
        component: () => import("@/pages/LoginInterface.vue"),
      },
      {
        name: 'team',
        path: "/team",
        meta: { background: 'busstation' },
        component: () => import("@/pages/TeamManagement.vue"),
      },
    ]
  },
];

export default routes;
