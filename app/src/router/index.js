import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const enterSerialnumber = () =>
  import(/* webpackChunkName: 'EnterSerialnumber' */ '../views/EnterSerialnumber.vue')
const download = () =>
  import(/* webpackChunkName: 'Download', webpackPrefetch: true */ '../views/Download.vue')

const routes = [
  {
    path: '/',
    redirect: '/serialnumber',
  },
  {
    path: '/serialnumber/:serialnumber?',
    name: 'EnterSerialnumber',
    component: enterSerialnumber,
  },
  {
    path: '/download',
    name: 'Download',
    component: download,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
