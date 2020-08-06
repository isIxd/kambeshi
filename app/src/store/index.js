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
    setContents: (state, type, data) => {
      state[type] = data
    },
  },
  actions: {
    setSerialnumber: ({ commit }, serialnumber) => {
      commit('setSerialnumber', serialnumber)
    },
    validateSerialnumber: async ({ state, commit }) => {
      validateSerialnumber(state.serialnumber)
        .then(data => {
          commit('setSerialnumber', data)
          switch (data.type) {
            case 'package':
              getPackageData(data.contents)
                .then(packageData => {
                  commit('setContents', 'package', packageData)
                })
                .catch(err => console.log(err))
              break
            case 'single':
              getSingleData(data.contents)
                .then(singleData => {
                  commit('setContents', 'single', singleData)
                })
                .catch(err => console.log(err))
              break
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
  },
  modules: {},
})
