const availablePermissions = {
  GP: {
    title: "Get Progression",
    description:
      "Allows access to read your general progression information, including your TarkovTracker display name, quest progress, hideout progress",
  },
  TP: {
    title: "Get Team Progression",
    description:
      "Allows access to read a virtual copy of your team's progress, including display names, quest, and hideout progress",
  },
  WP: {
    title: "Write Progression",
    description:
      "Allows access to update your TarkovTracker progress data on your behalf",
  },
};

export default availablePermissions;
