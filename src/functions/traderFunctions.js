import traderData from '../../tarkovdata/traders.json'

const traders = new Map()

export default {
  initTraders: function () {
    const t = Object.keys(traderData)
    t.forEach(key => {
      traders.set(traderData[key].id, traderData[key])
    })
  },
  getTraderById: function (id) {
    if (traders.size === 0) {
      this.initTraders()
    }
    return traders.get(id)
  }
}
