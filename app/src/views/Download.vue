<template>
  <v-container :class="{ 'page-noScroll': !enableScroll }">
    <DownloadSingle v-if="type == 'single'" v-on:enableScroll="setEnableScroll"></DownloadSingle>
    <DownloadPackage v-if="type == 'package'" v-on:enableScroll="setEnableScroll"></DownloadPackage>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  components: {
    DownloadPackage: () =>
      import(
        /* webpackChunkName: 'DownloadPackage', webpackPrefetch: true */ '../components/DownloadPackage'
      ),
    DownloadSingle: () =>
      import(
        /* webpackChunkName: 'DownloadSingle', webpackPrefetch: true */ '../components/DownloadSingle'
      ),
  },
  data: function() {
    return {
      enableScroll: false,
    }
  },
  created: function() {},
  mounted: function() {
    if (!this.serialnumberExists) this.$router.replace({ path: '/serialnumber' })
  },
  methods: {
    setEnableScroll(isEnabled) {
      this.enableScroll = isEnabled
    },
  },
  computed: {
    ...mapState(['serialnumber', 'serialnumberExists', 'isSerialnumberValid', 'type']),
  },
  watch: {
    type: newVal => {
      console.log(newVal)
    },
  },
}
</script>

<style lang="sass"></style>
