<template>
  <div class="pageContainer mt-n12" ref="pageContainer" :class="pageClass">
    <v-row ref="mainContainer" justify="space-between" :align="mainContainerAlign">
      <v-col
        cols="12"
        md="6"
        id="artwork"
        justify="center"
        ref="artwork"
        no-gutters
        :class="artworkClass"
      >
        <v-img
          contain
          aspect-ratio="1"
          :src="single.artwork"
          :max-height="artworkMaxHeight"
        ></v-img>
      </v-col>
      <v-col cols="12" md="6">
        <ContentsInfomation
          id="contentsInfo"
          ref="contentsInfo"
          refer="contentsInfo"
          :style="contentsInfoStyleObj"
          :class="contentsInfoClass"
          :name="single.name"
          :artist="single.artist"
          :releaseDate="releaseDate"
          :size="contentsInfoSize"
          ><v-row
            ref="downloadBtn"
            justify="end"
            class="download"
            :class="downloadClass"
            :style="downloadBtnStyle"
          >
            <v-col>
              <DownloadDetail>
                <template v-slot:btn="slotProps">
                  <v-btn
                    id="btn"
                    :x-large="$vuetify.breakpoint.mdAndUp"
                    :large="$vuetify.breakpoint.smAndDown"
                    color="primary"
                    :block="$vuetify.breakpoint.xs"
                    v-bind="slotProps.dialogProps.attrs"
                    v-on="slotProps.dialogProps.on"
                    >{{ downloadBtnMsg }}</v-btn
                  >
                </template>
              </DownloadDetail>
            </v-col>
          </v-row>
        </ContentsInfomation>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ContentsInfomation from '../components/ContentsInfomation'
import DownloadDetail from '../components/DownloadDetail'

export default {
  components: {
    ContentsInfomation,
    DownloadDetail,
  },
  data: function() {
    return {
      contentsInfoStyleObj: {
        background: '',
        paddingRight: '12px',
      },
      downloadBtnStyle: {
        background: '',
        bottom: '0px',
        top: '',
        right: '',
        paddingBottom: '12px',
      },
      artworkMaxHeightReComputeCounter: 0,
      enableScroll: false,
    }
  },
  created: function() {
    window.addEventListener('resize', this.onResize)
    this.setContentsInfoBackground()
  },
  mounted: function() {
    this.$emit('enableScroll', false)
    setTimeout(() => {
      this.onResize()
    }, 10)
  },
  methods: {
    onResize() {
      const artworkPos = this.getAbsolutePosition(this.$refs.artwork)
      if (artworkPos.height == 0)
        setTimeout(() => {
          this.onResize()
        }, 100)

      const mainContainerPos = this.getAbsolutePosition(this.$refs.mainContainer)

      if (this.$vuetify.breakpoint.thresholds.xs > window.innerWidth) {
        this.$delete(this.downloadBtnStyle, 'top')
        this.$delete(this.downloadBtnStyle, 'right')
        this.$set(this.downloadBtnStyle, 'bottom', '0px')
      } else if (this.$vuetify.breakpoint.thresholds.sm < window.innerWidth) {
        this.$set(
          this.downloadBtnStyle,
          'bottom',
          window.innerHeight - mainContainerPos.bottom + 'px'
        )
        this.$set(this.downloadBtnStyle, 'right', window.innerWidth - mainContainerPos.right + 'px')
      }
    },
    extractNumber(str) {
      return str.replace(/[^-0-9.]/g, '')
    },
    getAbsolutePosition(elm) {
      const { top, bottom, left, right, width, height } = elm.getBoundingClientRect()
      const { top: bTop, left: bLeft } = document.body.getBoundingClientRect()
      return {
        top: top - bTop,
        bottom: bottom - bTop,
        left: left - bLeft,
        right: right - bLeft,
        width,
        height,
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
    setContentsInfoBackground() {
      // @TODO: set $vuetify page color
      const dark = '#121212'
      const light = '#FFFFFF'
      const rgb = this.hex2rgb(this.$vuetify.theme.dark ? dark : light)
      const background = `linear-gradient(to top, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1), 0%,rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8), 85%, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0))`
      this.$set(this.contentsInfoStyleObj, 'background', background)
    },
  },
  computed: {
    ...mapState([
      'serialnumber',
      'isSerialnumberValid',
      'type',
      'single',
      'downloadCountInSession',
    ]),
    releaseDate: function() {
      let result = ''
      if (typeof this.single.releaseDate.toDate == 'function') {
        result = this.single.releaseDate.toDate().toLocaleDateString()
      }
      return result
    },
    downloadClass: function() {
      return {
        'download-xs': this.$vuetify.breakpoint.xs,
        'download-sm': this.$vuetify.breakpoint.sm,
        'download-mdAndUp': this.$vuetify.breakpoint.mdAndUp,
      }
    },
    pageClass: function() {
      return {
        'page-noScroll': !this.enableScroll,
        'page-scroll': this.enableScroll,
        'pageContainer-fix':
          this.$vuetify.breakpoint.smAndDown &&
          this.$vuetify.breakpoint.width / this.$vuetify.breakpoint.height > 0.6,
      }
    },
    contentsInfoSize: function() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 4
        case 'sm':
          return 3
        case 'md':
          return 3
        case 'lg':
          return 2
        case 'xl':
          return 1
        default:
          return 2
      }
    },
    contentsInfoClass: function() {
      return {
        'pl-12': this.$vuetify.breakpoint.xl,
        'pl-8': this.$vuetify.breakpoint.lg,
        'pl-6': this.$vuetify.breakpoint.md,
        'contentsInfo-fix-xs':
          this.$vuetify.breakpoint.xs &&
          this.$vuetify.breakpoint.width / this.$vuetify.breakpoint.height > 0.6,
        'contentsInfo-fix-sm':
          this.$vuetify.breakpoint.sm &&
          this.$vuetify.breakpoint.width / this.$vuetify.breakpoint.height > 0.6,
      }
    },
    artworkClass: function() {
      return {
        'pr-12': this.$vuetify.breakpoint.xl,
        'pr-8': this.$vuetify.breakpoint.lg,
        'pr-6': this.$vuetify.breakpoint.md,
      }
    },
    artworkMaxHeight: function() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.artworkMaxHeightReComputeCounter++ // for re compute
      if (this.$vuetify.breakpoint.mdAndUp) {
        return this.$vuetify.breakpoint.height - 96 + 'px'
      } else if (
        this.$vuetify.breakpoint.mdAndDown &&
        this.$vuetify.breakpoint.width / this.$vuetify.breakpoint.height > 0.6
      ) {
        let result
        try {
          const pageContainerPos = this.getAbsolutePosition(this.$refs.pageContainer)
          const contentsInfoPos = this.getAbsolutePosition(this.$refs.contentsInfo.$el)
          if (this.$vuetify.breakpoint.md)
            result = contentsInfoPos.top - pageContainerPos.top - 36 + 'px'
          else result = contentsInfoPos.top - pageContainerPos.top + 'px'
        } catch (e) {
          this.$nextTick(() => {
            this.artworkMaxHeightReComputeCounter++ // for re compute
          })
        }
        return result
      } else return '600px'
    },
    mainContainerAlign: function() {
      if (
        this.$vuetify.breakpoint.smAndDown &&
        this.$vuetify.breakpoint.width / this.$vuetify.breakpoint.height > 0.6
      ) {
        return 'start'
      } else {
        return 'center'
      }
    },
    downloadBtnMsg: function() {
      if (this.downloadCountInSession == 0) return 'ダウンロード'
      else return 'もう一度ダウンロード'
    },
  },
  watch: {
    enableScroll: function(newVal) {
      this.$emit('enableScroll', newVal)
    },
  },
}
</script>

<style lang="sass" scoped>
.pageContainer
  height: 100vh
  position: relative
  display: flex
  justify-content: center
  align-items: center

.pageContainer-fix
  align-items: start
  padding-top: 32px

.page-scroll
.page-noScroll
  overflow: hidden
  margin:
    bottom:-64px
.contentsInfo
  margin:
    top: 24px
.contentsInfo-fix-xs
  position: fixed
  bottom: 0px
  padding-bottom: 75px
  padding-top: 20px
.contentsInfo-fix-sm
  position: fixed
  bottom: -72px
.download
  z-index: 3
  text-align: right
.download-xs
  position: fixed
  width: 100%
.download-sm
  transform: translateY(-100%)
.download-mdAndUp
  position: fixed
</style>
