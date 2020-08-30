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
  metaInfo() {
    const ref = this.type == 'single' ? this.single : this.type == 'package' ? this.pack : null
    if (!ref) return
    return {
      title: ref.name,
      link: [
        {
          rel: 'icon',
          href: ref.artwork,
        },
      ],
    }
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
    ...mapState(['serialnumber', 'serialnumberExists', 'isSerialnumberValid', 'type', 'single']),
    ...mapState({ pack: state => state.package }), // 'package' is reserved name
  },
  watch: {
    type: newVal => {
      console.log(newVal)
    },
  },
}
</script>

<style lang="sass"></style>
