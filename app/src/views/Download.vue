<template>
  <v-container :class="{ 'page-noScroll': !enableScroll }">
    <DownloadSingle v-if="type == 'single'" v-on:enableScroll="setEnableScroll"></DownloadSingle>
    <DownloadPackage v-if="type == 'package'" v-on:enableScroll="setEnableScroll"></DownloadPackage>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import DownloadPackage from '../components/DownloadPackage'
import DownloadSingle from '../components/DownloadSingle'

export default {
  components: {
    DownloadPackage,
    DownloadSingle,
  },
  data: function() {
    return {
      enableScroll: false,
    }
  },
  created: function() {
    // for dev
    this.$store.dispatch('setSerialnumber', '74332454')
    // this.$store.dispatch('setSerialnumber', '44438208')

    this.$store.dispatch('validateSerialnumber')
  },
  mounted: function() {},
  methods: {
    setEnableScroll(isEnabled) {
      this.enableScroll = isEnabled
    },
  },
  computed: {
    ...mapState(['serialnumber', 'isSerialnumberValid', 'type']),
  },
  watch: {
    type: newVal => {
      console.log(newVal)
    },
  },
}
</script>

<style lang="sass"></style>
