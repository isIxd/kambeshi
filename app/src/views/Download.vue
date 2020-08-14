<template>
  <v-container :class="{ 'page-noScroll': !enableScroll }">
    <template v-if="type == 'single'"></template>
    <DownloadPackage
      v-else-if="type == 'package'"
      v-on:enableScroll="setEnableScroll"
    ></DownloadPackage>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import DownloadPackage from '../components/DownloadPackage'

export default {
  components: {
    DownloadPackage,
  },
  data: function() {
    return {
      enableScroll: false,
    }
  },
  created: function() {
    // for dev
    this.$store.dispatch('setSerialnumber', '44438208')
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
  watch: {},
}
</script>

<style lang="sass"></style>
