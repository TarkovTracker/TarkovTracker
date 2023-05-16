// These functions are used in both the Pinia store and API to access the store, and ensure that both systems update the store in the same way.

// The default state to use for new stores
export const defaultState = {
  level: 1,
  gameEdition: 1,
  pmcFaction: "USEC",
  displayName: null,
  taskObjectives: {},
  taskCompletions: {},
  hideoutParts: {},
  hideoutModules: {},
};

// Getters are for reading store state in a uniform manner
export const getters = {
  // State getters
  playerLevel(state) {
    return state.level ?? 1;
  },

  getGameEdition(state) {
    return state.gameEdition ?? 1;
  },

  getPMCFaction(state) {
    return state.pmcFaction ?? "USEC";
  },

  getDisplayName(state) {
    // If an empty string, return null
    if (state.displayName === "") {
      return null;
    } else {
      return state.displayName ?? null;
    }
  },

  getObjectiveCount(state) {
    return (objectiveId) => state?.taskObjectives?.[objectiveId]?.count ?? 0;
  },

  getHideoutPartCount(state) {
    return (objectiveId) => state?.hideoutParts?.[objectiveId]?.count ?? 0;
  },

  // Check if a specific task is completed
  isTaskComplete(state) {
    return (taskId) => state?.taskCompletions?.[taskId]?.complete ?? false;
  },

  isTaskFailed(state) {
    return (taskId) => state?.taskCompletions?.[taskId]?.failed ?? false;
  },

  // Check if a specific task objective is completed
  isTaskObjectiveComplete(state) {
    return (objectiveId) =>
      state?.taskObjectives?.[objectiveId]?.complete ?? false;
  },

  // Check if a specific hideout part is completed
  isHideoutPartComplete(state) {
    return (objectiveId) =>
      state?.hideoutParts?.[objectiveId]?.complete ?? false;
  },

  // Check if a specific hideout objective is completed
  isHideoutModuleComplete(state) {
    return (hideoutId) => state?.hideoutModules?.[hideoutId]?.complete ?? false;
  },
};

// Actions are for mutations and setters
export const actions = {
  incrementLevel() {
    if (this.level) {
      this.level++;
    } else {
      this.level = 2;
    }
  },

  decrementLevel() {
    if (this.level) {
      this.level--;
    } else {
      this.level = 1;
    }
  },

  setLevel(level) {
    this.level = level;
  },

  setGameEdition(edition) {
    this.gameEdition = edition;
  },

  setPMCFaction(faction) {
    this.pmcFaction = faction;
  },

  setDisplayName(name) {
    if (typeof name === "string") {
      this.displayName = name;
    } else {
      this.displayName = null;
    }
  },

  setObjectiveCount(objectiveId, count) {
    if (!this?.taskObjectives) {
      this.taskObjectives = {};
    }
    if (!this.taskObjectives?.[objectiveId]) {
      this.taskObjectives[objectiveId] = {};
    }
    this.taskObjectives[objectiveId] = {
      count: count,
    };
  },

  setHideoutPartCount(objectiveId, count) {
    if (!this?.hideoutParts) {
      this.hideoutParts = {};
    }
    if (!this.hideoutParts?.[objectiveId]) {
      this.hideoutParts[objectiveId] = {};
    }
    this.hideoutParts[objectiveId] = {
      count: count,
    };
  },

  // Set a task as complete
  setTaskComplete(taskId) {
    if (!this?.taskCompletions) {
      this.taskCompletions = {};
    }
    if (!this.taskCompletions?.[taskId]) {
      this.taskCompletions[taskId] = {};
    }
    this.taskCompletions[taskId] = {
      complete: true,
      timestamp: Date.now(),
    };
  },

  setTaskFailed(taskId) {
    if (!this?.taskCompletions) {
      this.taskCompletions = {};
    }
    if (!this.taskCompletions?.[taskId]) {
      this.taskCompletions[taskId] = {};
    }
    this.taskCompletions[taskId] = {
      complete: true,
      failed: true,
      timestamp: Date.now(),
    };
  },

  setTaskUncompleted(taskId) {
    if (!this?.taskCompletions) {
      this.taskCompletions = {};
    }
    if (!this.taskCompletions?.[taskId]) {
      this.taskCompletions[taskId] = {};
    }
    this.taskCompletions[taskId] = {
      complete: false,
      failed: false,
    };
  },

  // Set a task objective as complete
  setTaskObjectiveComplete(objectiveId) {
    if (!this?.taskObjectives) {
      this.taskObjectives = {};
    }
    if (!this.taskObjectives?.[objectiveId]) {
      this.taskObjectives[objectiveId] = {};
    }
    this.taskObjectives[objectiveId] = {
      complete: true,
      timestamp: Date.now(),
    };
  },

  setTaskObjectiveUncomplete(objectiveId) {
    if (!this?.taskObjectives) {
      this.taskObjectives = {};
    }
    if (!this.taskObjectives?.[objectiveId]) {
      this.taskObjectives[objectiveId] = {};
    }
    this.taskObjectives[objectiveId] = {
      complete: false,
    };
  },

  toggleTaskObjectiveComplete(objectiveId) {
    if (this.isTaskObjectiveComplete(objectiveId)) {
      this.setTaskObjectiveUncomplete(objectiveId);
    } else {
      this.setTaskObjectiveComplete(objectiveId);
    }
  },

  // Set a hideout part as complete
  setHideoutPartComplete(objectiveId) {
    if (!this?.hideoutParts) {
      this.hideoutParts = {};
    }
    if (!this.hideoutParts?.[objectiveId]) {
      this.hideoutParts[objectiveId] = {};
    }
    this.hideoutParts[objectiveId] = {
      complete: true,
      timestamp: Date.now(),
    };
  },

  // Set a hideout module as complete
  setHideoutModuleComplete(hideoutId) {
    if (!this?.hideoutModules) {
      this.hideoutModules = {};
    }
    if (!this.hideoutModules?.[hideoutId]) {
      this.hideoutModules[hideoutId] = {};
    }
    this.hideoutModules[hideoutId] = {
      complete: true,
      timestamp: Date.now(),
    };
  },

  setHideoutModuleUncomplete(hideoutId) {
    if (!this?.hideoutModules) {
      this.hideoutModules = {};
    }
    if (!this.hideoutModules?.[hideoutId]) {
      this.hideoutModules[hideoutId] = {};
    }
    this.hideoutModules[hideoutId] = {
      complete: false,
    };
  },

  setHideoutPartUncomplete(hideoutId) {
    if (!this?.hideoutParts) {
      this.hideoutParts = {};
    }
    if (!this.hideoutParts?.[hideoutId]) {
      this.hideoutParts[hideoutId] = {};
    }
    this.hideoutParts[hideoutId] = {
      complete: false,
    };
  },

  toggleHideoutPartComplete(hideoutId) {
    if (this.isHideoutPartComplete(hideoutId)) {
      this.setHideoutPartUncomplete(hideoutId);
    } else {
      this.setHideoutPartComplete(hideoutId);
    }
  },
};
