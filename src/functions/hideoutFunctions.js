import hideoutData from '../tarkovdata/hideout.json'

export function getHideoutModule(name, level) {
  var tempHideout = hideoutData.modules
  // Find the right module
  for (var z = tempHideout.length - 1; z >= 0; z--) {
    if (tempHideout[z].module.toLowerCase() === name.toLowerCase() && tempHideout[z].level === level) {
      return tempHideout[z];
    }
  }
  return null;
}
