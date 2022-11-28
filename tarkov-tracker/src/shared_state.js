// These functions are used in both the Pinia store and API to access the store, and ensure that both systems update the store in the same way.

// The default state to use for new stores
export const defaultState = {
  level: 1,
  gameEdition: 1,
  streamerMode: false,
}

// Getters are for reading store state in a uniform manner
export const getters = {
  // State getters
  playerLevel(state) {
    return state.level || 1
  },

  getGameEdition(state) {
    return state.gameEdition || 1
  },

  getStreamerMode(state) {
    return state.streamerMode || false
  }
}

// Actions are for mutations and setters
export const actions = {
  incrementLevel() {
    if (this.level) {
      this.level++
    } else {
      this.level = 2
    }
  },
  
  decrementLevel() {
    if (this.level) {
      this.level--
    } else {
      this.level = 1
    }
  },

  setGameEdition(edition) {
    this.gameEdition = edition
  },

  setStreamerMode(mode) {
    this.streamerMode = mode
  }
}