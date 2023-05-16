const routes = [
  {
    // Standard Layout
    path: "/",
    component: () => import("@/components/layout/StandardLayout.vue"),
    children: [
      {
        // Default route
        name: "dashboard",
        path: "/",
        alias: ["/", "/dashboard"],
        meta: { background: "sunset" },
        component: () => import("@/pages/TrackerDashboard.vue"),
      },
      {
        name: "neededitems",
        path: "/items",
        meta: {},
        component: () => import("@/pages/NeededItems.vue"),
      },
      {
        name: "tasks",
        path: "/tasks",
        meta: {},
        component: () => import("@/pages/TaskList.vue"),
      },
      {
        name: "hideout",
        path: "/hideout",
        meta: { background: "hideout" },
        component: () => import("@/pages/HideoutList.vue"),
      },
      {
        name: "settings",
        path: "/settings",
        meta: { background: "gas" },
        component: () => import("@/pages/TrackerSettings.vue"),
      },
      {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: () => import("@/pages/NotFound.vue"),
      },
      {
        name: "login",
        path: "/login",
        meta: { background: "checkpoint" },
        component: () => import("@/pages/LoginInterface.vue"),
      },
      {
        name: "team",
        path: "/team",
        meta: { background: "busstation" },
        component: () => import("@/pages/TeamManagement.vue"),
      },
      {
        name: "taskeditor",
        path: "/taskeditor",
        meta: {},
        component: () => import("@/pages/TaskEditor.vue"),
      },
      {
        name: "usertester",
        path: "/usertester",
        meta: {},
        component: () => import("@/pages/UserTester.vue"),
      },
    ],
  },
];

export default routes;
