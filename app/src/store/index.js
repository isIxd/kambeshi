import Vue from 'vue'
import Vuex from 'vuex'
import { validateSerialnumber, getPackageData, getSingleData } from '../firebase'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    serialnumber: '',
    serialnumberExists: false,
    isSerialnumberValid: false,
    downloadsCount: 0,
    downloadsRemaining: 0,
    type: '',
    package: { name: '', artist: '', artwork: '', releaseDate: {}, contents: [] },
    single: { name: '', artist: '', artwork: '', releaseDate: {} },
    downloadCountInSession: 0,
  },
  mutations: {
    setSerialnumber: (state, serialnumber) => {
      state.serialnumber = serialnumber
      state.downloadCountInSession = 0
    },
    setTargetData: (state, data) => {
      state.serialnumberExists = true
      state.isSerialnumberValid = data.downloadsRemaining > 0
      state.type = data.type
      state.downloadsCount = data.downloadsCount
      state.downloadsRemaining = data.downloadsRemaining
    },
    setContents: (state, payload) => {
      Object.keys(state[payload.type]).map(key => {
        Vue.set(state[payload.type], key, payload.data[key])
      })
    },
    incrementDownloadCountInSession: state => {
      state.downloadCountInSession++
    },
  },
  actions: {
    setSerialnumber: ({ commit }, serialnumber) => {
      commit('setSerialnumber', serialnumber)
    },
    validateSerialnumber: ({ state, commit, dispatch }) => {
      return new Promise(resolve => {
        validateSerialnumber(state.serialnumber)
          .then(data => {
            commit('setTargetData', data)
            dispatch('setContents', data)
            resolve({ serialnumberExists: true })
          })
          .catch(err => {
            console.error(err)
            resolve({ serialnumberExists: false })
          })
      })
    },
    setContents: ({ commit }, data) => {
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
    },
    decrementDownloadsRemaining: ({ commit, state }) => {
      commit('setTargetData', {
        serialnumberExists: state.serialnumberExists,
        isSerialnumberValid: state.isSerialnumberValid,
        type: state.type,
        downloadsCount: state.downloadsCount,
        downloadsRemaining: state.downloadsRemaining - 1,
      })
    },
    incrementDownloadCountInSession: ({ commit }) => {
      commit('incrementDownloadCountInSession')
    },
  },
  modules: {},
  getters: {
    getPackage: state => state.package,
  },
  plugins: [createPersistedState({ storage: window.sessionStorage })],
})
