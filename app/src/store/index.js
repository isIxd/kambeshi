import Vue from 'vue'
import Vuex from 'vuex'
import { validateSerialnumber, getPackageData, getSingleData } from '../firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    serialnumber: '',
    serialnumberExists: false,
    isSerialnumberValid: false,
    type: '',
    package: { name: '', artist: '', artwork: '', releaseDate: {}, contents: [] },
    single: { name: '', artist: '', artwork: '', releaseDate: {} },
  },
  mutations: {
    setSerialnumber: (state, serialnumber) => {
      state.serialnumber = serialnumber
    },
    setTargetData: (state, data) => {
      state.serialnumberExists = true
      state.isSerialnumberValid = data.downloadsRemaining > 0
      state.type = data.type
    },
    setContents: (state, payload) => {
      Object.keys(state[payload.type]).map(key => {
        Vue.set(state[payload.type], key, payload.data[key])
      })
    },
  },
  actions: {
    setSerialnumber: ({ commit }, serialnumber) => {
      commit('setSerialnumber', serialnumber)
    },
    validateSerialnumber: async ({ state, commit }) => {
      validateSerialnumber(state.serialnumber)
        .then(data => {
          commit('setTargetData', data)
          switch (data.type) {
            case 'package':
              getPackageData(data.contents)
                .then(packageData => {
                  commit('setContents', { type: 'package', data: packageData })
                })
                .catch(err => console.log(err))
              break
            case 'single':
              getSingleData(data.contents)
                .then(singleData => {
                  commit('setContents', { type: 'single', data: singleData })
                })
                .catch(err => console.log(err))
              break
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
  },
  modules: {},
})
