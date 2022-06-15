import hideoutData from '../../tarkovdata/hideout.json'

export default {
  getHideoutModule: function (name, level) {
    const tempHideout = hideoutData.modules
    // Find the right module
    for (let z = tempHideout.length - 1; z >= 0; z--) {
      if (tempHideout[z].module.toLowerCase() === name.toLowerCase() && tempHideout[z].level === level) {
        return tempHideout[z]
      }
    }
    return null
  },
  completeModule: function (store, moduleId) {
    store.set('progress/complete_hideout', moduleId)
  },
  completeModuleObjective: function (store, name, level) {
    const tempHideout = hideoutData.modules
    const tempModuleData = this.getHideoutModule(name, level)

    // Mark all of the requirements for this module as complete
    for (var i = tempModuleData.require.length - 1; i >= 0; i--) {
      store.set('progress/complete_hideout_objective', tempModuleData.require[i].id)
    }
    // Search for this module as a requirement for other modules, and mark it as complete
    for (i = tempHideout.length - 1; i >= 0; i--) {
      for (let x = tempHideout[i].require.length - 1; x >= 0; x--) {
        // If requirement is a module, and its this module, mark it as complete
        if (tempHideout[i].require[x].type == 'module' && tempHideout[i].require[x].name == name && tempHideout[i].require[x].quantity <= level) {
          store.set('progress/complete_hideout_objective', tempHideout[i].require[x].id)
        }
      }
    }
  },
  uncompleteModule: function (store, moduleId) {
    store.set('progress/uncomplete_hideout', moduleId)
  },
  uncompleteModuleObjective: function (store, name, level) {
    const tempHideout = hideoutData.modules
    const tempModuleData = this.getHideoutModule(name, level)

    // Mark all of the requirements for this module as complete
    for (var i = tempModuleData.require.length - 1; i >= 0; i--) {
      store.set('progress/uncomplete_hideout_objective', tempModuleData.require[i].id)
    }
    // Search for this module as a requirement for other modules, and mark it as complete
    for (i = tempHideout.length - 1; i >= 0; i--) {
      for (let x = tempHideout[i].require.length - 1; x >= 0; x--) {
        // If requirement is a module, and its this module, mark it as complete
        if (tempHideout[i].require[x].type == 'module' && tempHideout[i].require[x].name == name && tempHideout[i].require[x].quantity <= level) {
          store.set('progress/uncomplete_hideout_objective', tempHideout[i].require[x].id)
        }
      }
    }
  }
}
