<template>
  <div class="pageContainer" ref="pageContainer" :class="pageClass">
    <v-row>
      <v-col md="4" cols="12">
        <v-row id="artwork" justify="center" ref="artwork" no-gutters class="mb-6"
          ><v-col cols="10" sm="6" md="12"><v-img contain :src="pack.artwork"></v-img></v-col
        ></v-row>
        <ContentsInfomation
          ref="contentsInfo"
          refer="contentsInfo"
          class="contentsInfo"
          :class="contentsInfoClass"
          :style="contentsInfoStyleObj"
          :name="pack.name"
          :artist="pack.artist"
          :releaseDate="new Date(pack.releaseDate).toLocaleDateString()"
          :size="contentsInfoSize"
        >
          <v-row
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
                    color="accent"
                    :block="$vuetify.breakpoint.xs"
                    v-bind="slotProps.dialogProps.attrs"
                    v-on="slotProps.dialogProps.on"
                    @click="slotProps.download"
                    >{{ downloadBtnMsg }}</v-btn
                  >
                </template>
              </DownloadDetail>
            </v-col>
          </v-row>
        </ContentsInfomation>
      </v-col>

      <v-col
        id="list"
        ref="list"
        :style="{ paddingTop: $vuetify.breakpoint.smAndDown ? '0px' : 'inherit' }"
      >
        <v-simple-table
          fixed-header
          :height="listHeight"
          :style="{
            paddingBottom: !enableScroll ? 0 : $vuetify.breakpoint.xs ? '80px' : '36px',
          }"
          ref="table"
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
                <td>{{ new Date(item.releaseDate).toLocaleDateString() }}<br /></td>
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
import DownloadDetail from '../components/DownloadDetail'

export default {
  components: {
    ContentsInfomation,
    DownloadDetail,
  },
  data: function() {
    return {
      contentsInfoStyleObj: {},
      listHeight: '150px',
      downloadBtnStyle: {
        background: '',
        bottom: '0px',
        paddingBottom: '12px',
      },
      contentsInfoSize: 2,
      enableScroll: true,
    }
  },
  created: function() {
    window.addEventListener('resize', this.onResize)
    this.$store.watch(
      () => this.$store.getters.getPackage,
      pack => console.log(pack)
    )
  },
  mounted: function() {
    const interval = setInterval(() => {
      const target = document.getElementById('list')
      if (target) {
        clearInterval(interval)
        this.onResize()
      }
    }, 100)
    this.setDownloadBtnBackground()

    // テーブルのbackground
    const color = this.$vuetify.theme.themes[this.$vuetify.theme.dark ? 'dark' : 'light'].background
    const tableTag = this.$refs.table.$el.querySelector('table')
    tableTag.style.background = color
    tableTag.querySelectorAll('th').forEach(th => (th.style.background = color))
  },
  methods: {
    onResize() {
      // ===== list の処理 =====
      let result
      try {
        const listPos = this.getAbsolutePosition(this.$refs.list.childNodes[0])
        const listPagePos = this.getPagePosition(this.$refs.list.childNodes[0])
        const downloadBtnPos = this.getAbsolutePosition(this.$refs.downloadBtn)
        const contentsInfoPos = this.getAbsolutePosition(this.$refs.contentsInfo.$el)
        const artworkPos = this.getAbsolutePosition(this.$refs.artwork)
        const listHeightThreshold = 160

        if (artworkPos.height == 0)
          setTimeout(() => {
            this.onResize()
          }, 100)

        switch (this.$vuetify.breakpoint.name) {
          case 'xs':
            result = window.innerHeight - listPagePos.top - downloadBtnPos.height + 'px'
            break
          case 'sm':
            result = window.innerHeight - listPagePos.top - 24 + 'px'
            break
          default:
            result = contentsInfoPos.top - listPos.top - 36 + 'px'
            break
        }

        if (
          parseInt(result) < listHeightThreshold &&
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
      this.listHeight = result

      // ===== contentsInfo の処理 =====
      try {
        const listPos = this.getAbsolutePosition(this.$refs.list.childNodes[0])
        const pageContainerPos = this.getAbsolutePosition(this.$refs.pageContainer)
        const artworkPos = this.getAbsolutePosition(this.$refs.artwork)

        const mdHeightThreshold = 620

        // set default (xs)
        this.$set(this.contentsInfoStyleObj, 'width', pageContainerPos.width + 'px')
        this.$delete(this.contentsInfoStyleObj, 'left')
        this.contentsInfoSize = 4

        if (window.innerWidth < this.$vuetify.breakpoint.thresholds.xs) {
          // xs
        } else if (window.innerWidth < this.$vuetify.breakpoint.thresholds.sm) {
          // sm
          this.contentsInfoSize = 3
        } else if (
          window.innerWidth < this.$vuetify.breakpoint.thresholds.md &&
          window.innerHeight < mdHeightThreshold
        ) {
          // md && (height < mdHeightThreshold)
          this.$set(this.contentsInfoStyleObj, 'width', listPos.width + 'px ')
          this.$set(this.contentsInfoStyleObj, 'left', artworkPos.width + 36 + 'px')
          this.contentsInfoSize = 4
        } else if (window.innerWidth < this.$vuetify.breakpoint.thresholds.md) {
          // md
          this.contentsInfoSize = 2
        } else {
          // lg and xl
          this.$set(this.contentsInfoStyleObj, 'width', listPos.width - 12 + 'px')
          this.$set(this.contentsInfoStyleObj, 'left', artworkPos.width + 36 + 'px')
          this.contentsInfoSize = 2
        }
      } catch (e) {
        // console.log(e)
      }

      // ===== button の処理 =====
      this.setDownloadBtnBackground()
    },

    getAbsolutePosition(elm) {
      const { top, bottom, left, right, width, height } = elm.getBoundingClientRect()
      const { top: bTop, left: bLeft } = document.body.getBoundingClientRect()
      return {
        top: top - bTop - window.scrollY,
        bottom: bottom - bTop - window.scrollY,
        left: left - bLeft,
        right: right - bLeft,
        width,
        height,
      }
    },
    getPagePosition(elm) {
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
    setDownloadBtnBackground() {
      const color = this.$vuetify.theme.themes[this.$vuetify.theme.dark ? 'dark' : 'light']
        .background
      // ダウンロードボタンのbackground
      if (this.$vuetify.breakpoint.thresholds.xs < window.innerWidth) {
        this.$delete(this.downloadBtnStyle, 'background')
      } else {
        const rgb = this.hex2rgb(color)
        const background = `linear-gradient(to top, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1), 95%, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0))`
        this.$set(this.downloadBtnStyle, 'background', background)
      }
    },
  },
  computed: {
    ...mapState(['serialnumber', 'isSerialnumberValid', 'type', 'downloadCountInSession']),
    ...mapState({ pack: state => state.package }), // 'package' is reserved name
    downloadClass: function() {
      return {
        'download-xs': this.$vuetify.breakpoint.xs,
        'download-sm': this.$vuetify.breakpoint.sm,
      }
    },
    pageClass: function() {
      return {
        'py-3': this.$vuetify.breakpoint.mdAndUp,
        'page-noScroll': !this.enableScroll,
        'page-scroll': this.enableScroll,
      }
    },
    contentsInfoClass: function() {
      return {
        'contentsInfo-xs': this.$vuetify.breakpoint.xs,
        'contentsInfo-smAndUp': this.$vuetify.breakpoint.smAndUp,
        'contentsInfo-mdAndUp': this.$vuetify.breakpoint.mdAndUp,
      }
    },
    downloadBtnMsg: function() {
      if (this.downloadCountInSession == 0) return 'ダウンロード'
      else return 'もう一度ダウンロード'
    },
  },
  watch: {
    $vuetify: function() {
      this.setDownloadBtnBackground()
    },
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
.page-scroll
.page-noScroll
  overflow: hidden
  margin:
    bottom:-64px
.contentsInfo
  margin:
    top: 24px
.download
  z-index: 3
  transform: translateY(-100%)
  text-align: right
.download-xs
  position: fixed
  transform: translateY(0%) !important
  width: 100%
.download-sm


.contentsInfo-xs
.contentsInfo-smAndUp
  margin:
    bottom: -76px
.contentsInfo-mdAndUp
  position: absolute
  bottom: 100px
  margin:
    bottom: -76px
  overflow: hidden
.v-data-table
  background-color: inherit
</style>
