<template>
  <div id="page" ref="pageContainer" :class="pageClass">
    <v-row>
      <v-col md="4" cols="12">
        <v-row id="artwork" justify="center" ref="artwork" no-gutters class="mb-6"
          ><v-col cols="10" sm="6" md="12"><v-img contain :src="pack.artwork"></v-img></v-col
        ></v-row>
        <ContentsInfomation
          id="info"
          ref="info"
          refer="info"
          :style="infoStyleObj"
          :name="pack.name"
          :artist="pack.artist"
          :releaseDate="releaseDate"
          :size="infoSize"
        >
          <v-row
            id="downloadBtn"
            ref="downloadBtn"
            justify="end"
            :class="downloadClass"
            :style="downloadBtnStyle"
          >
            <v-col
              ><v-btn
                :x-large="$vuetify.breakpoint.mdAndUp"
                :large="$vuetify.breakpoint.smAndDown"
                color="primary"
                :block="$vuetify.breakpoint.xs"
                >ダウンロード</v-btn
              >
            </v-col>
          </v-row>
        </ContentsInfomation>
      </v-col>

      <v-col id="list" ref="list">
        <v-simple-table
          fixed-header
          :height="listHeight"
          :style="{ paddingBottom: !enableScroll ? 0 : $vuetify.breakpoint.xs ? '80px' : '36px' }"
        >
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-left">タイトル</th>
                <th class="text-left">アーティスト</th>
                <th class="text-left">リリース</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pack.contents" :key="item.id">
                <td>
                  <v-avatar tile size="36"><img :src="item.artwork"/></v-avatar>
                </td>
                <td>{{ item.name }}</td>
                <td>{{ item.artist }}</td>
                <td>{{ item.releaseDate.toDate().toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ContentsInfomation from '../components/ContentsInfomation'

export default {
  components: {
    ContentsInfomation,
  },
  data: function() {
    return {
      infoStyleObj: {},
      listHeight: '150px',
      downloadBtnStyle: {
        background: '',
        bottom: '0px',
        paddingBottom: '12px',
      },
      infoSize: 2,
      enableScroll: true,
    }
  },
  created: function() {
    window.addEventListener('resize', this.onResize)
    this.$store.watch(
      () => this.$store.getters.getPackage,
      pack => console.log(pack)
    )

    // for dev
    this.$store.dispatch('setSerialnumber', '44438208')
    this.$store.dispatch('validateSerialnumber')
  },
  mounted: function() {
    const interval = setInterval(() => {
      const target = document.getElementById('list')
      if (target) {
        clearInterval(interval)
        this.onResize()
      }
    }, 10)
    this.setDownloadBtnBackground()
  },
  methods: {
    onResize() {
      // ===== list の処理 =====
      let result
      try {
        const listPos = this.getAbsolutePosition(this.$refs.list.childNodes[0])
        const downloadBtnPos = this.getAbsolutePosition(this.$refs.downloadBtn)
        const infoPos = this.getAbsolutePosition(this.$refs.info.$el)
        const artworkPos = this.getAbsolutePosition(this.$refs.artwork)
        const listHeightThreshold = 150

        if (artworkPos.bottom - artworkPos.top <= 0)
          setTimeout(() => {
            this.onResize()
          }, 100)

        switch (this.$vuetify.breakpoint.name) {
          case 'xs':
            result = downloadBtnPos.top - listPos.top - 12 + 'px'
            break
          case 'sm':
            result = window.innerHeight - listPos.top - 36 + 'px'
            break
          default:
            result = infoPos.top - listPos.top - 36 + 'px'
            break
        }

        if (
          this.extractNumber(result) < listHeightThreshold &&
          window.innerWidth < this.$vuetify.breakpoint.thresholds.sm
        ) {
          result = undefined
          this.enableScroll = true
        } else {
          this.enableScroll = false
        }
      } catch (e) {
        // console.log(e)
      }
      // console.log(result)
      this.listHeight = result

      // ===== info の処理 =====
      try {
        const listElm = this.$refs.list
        const pageContainer = this.$refs.pageContainer
        const artworkElm = this.$refs.artwork

        const mdHeightThreshold = 570

        // set default (xs)
        this.$set(this.infoStyleObj, 'width', this.getContentWidth(pageContainer))
        this.$delete(this.infoStyleObj, 'left')
        this.infoSize = 4

        if (window.innerWidth < this.$vuetify.breakpoint.thresholds.xs) {
          // xs
        } else if (window.innerWidth < this.$vuetify.breakpoint.thresholds.sm) {
          // sm
          this.infoSize = 3
        } else if (
          window.innerWidth < this.$vuetify.breakpoint.thresholds.md &&
          window.innerHeight < mdHeightThreshold
        ) {
          // md && (height < mdHeightThreshold)
          this.$set(this.infoStyleObj, 'width', this.getContentWidth(listElm))
          this.$set(this.infoStyleObj, 'left', artworkElm.getBoundingClientRect().width + 36 + 'px')
          this.infoSize = 4
        } else if (window.innerWidth < this.$vuetify.breakpoint.thresholds.md) {
          // md
          this.infoSize = 2
        } else {
          // lg and xl
          this.$set(this.infoStyleObj, 'width', this.getContentWidth(listElm))
          this.$set(this.infoStyleObj, 'left', artworkElm.getBoundingClientRect().width + 36 + 'px')
          this.infoSize = 2
        }
      } catch (e) {
        // console.log(e)
      }

      // ===== button の処理 =====
      this.setDownloadBtnBackground()
    },

    getContentWidth(elm) {
      const computedStyle = window.getComputedStyle(elm)
      let width = this.extractNumber(computedStyle.width)
      let paddingLeft = this.extractNumber(computedStyle.paddingLeft)
      let paddingRight = this.extractNumber(computedStyle.paddingRight)
      return width - paddingLeft - paddingRight + 'px'
    },
    extractNumber(str) {
      return str.replace(/[^-0-9.]/g, '')
    },
    getAbsolutePosition(elm) {
      const { top, bottom, left, right } = elm.getBoundingClientRect()
      const { top: bTop, left: bLeft } = document.body.getBoundingClientRect()
      return {
        top: top - bTop,
        bottom: bottom - bTop,
        left: left - bLeft,
        right: right - bLeft,
      }
    },
    hex2rgb(hex) {
      if (hex.slice(0, 1) == '#') hex = hex.slice(1)
      if (hex.length == 3)
        hex =
          hex.slice(0, 1) +
          hex.slice(0, 1) +
          hex.slice(1, 2) +
          hex.slice(1, 2) +
          hex.slice(2, 3) +
          hex.slice(2, 3)
      return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map(str => {
        return parseInt(str, 16)
      })
    },
    setDownloadBtnBackground() {
      // @TODO: set $vuetify page color
      if (this.$vuetify.breakpoint.thresholds.xs < window.innerWidth) {
        this.$delete(this.downloadBtnStyle, 'background')
      } else {
        const dark = '#121212'
        const light = '#FFFFFF'
        const rgb = this.hex2rgb(this.$vuetify.theme.dark ? dark : light)
        const background = `linear-gradient(to top, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1), 95%, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0))`
        this.$set(this.downloadBtnStyle, 'background', background)
      }
    },
  },
  computed: {
    ...mapState(['serialnumber', 'isSerialnumberValid', 'type']),
    ...mapState({ pack: state => state.package }), // 'package' is reserved name
    releaseDate: function() {
      let result = ''
      if (typeof this.pack.releaseDate.toDate == 'function') {
        result = this.pack.releaseDate.toDate().toLocaleDateString()
      }
      return result
    },
    downloadClass: function() {
      return {
        'download-xs': this.$vuetify.breakpoint.xs,
      }
    },
    pageClass: function() {
      return {
        'py-3': this.$vuetify.breakpoint.mdAndUp,
        'page-noScroll': !this.enableScroll,
        'page-scroll': this.enableScroll,
      }
    },
  },
  watch: {
    $vuetify: function() {
      this.setDownloadBtnBackground()
    },
    enableScroll: function(newVal) {
      this.$emit('enableScroll', newVal)
      console.log('enableScroll', newVal)
    },
  },
}
</script>

<style lang="sass">
#page
  height: 100vh
  position: relative
.page-scroll
.page-noScroll
  overflow: hidden
  margin:
    bottom:-64px
#info
  margin:
    top: 24px
#downloadBtn
  z-index: 3
  transform: translateY(-100%)
  text-align: right
.download-xs
  position: fixed
  width: 100%
  transform: translateY(-0%) !important
#releaseDate
  &::before
   content: "・"
</style>
