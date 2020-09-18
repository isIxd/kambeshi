<template>
  <v-dialog v-model="dialog" persistent max-width="800">
    <template v-slot:activator="{ on, attrs }">
      <slot name="btn" v-bind:dialogProps="{ on, attrs }" v-bind:download="download"> </slot>
    </template>

    <v-card>
      <v-card-title class="text-center text-h6 text-md-h4" style="text-align:center">
        {{ dialogTitle }}
      </v-card-title>

      <v-card-text class="text-body-2 text-md-h6">
        <p></p>
        <v-progress-linear
          v-model="downloadedValue"
          :buffer-value="isSerialnumberValid ? downloadedValue : 100"
          :value="isSerialnumberValid ? downloadedValue : 100"
          color="accent"
          :height="$vuetify.breakpoint.mobile ? '12px' : '16px'"
          rounded
          :stream="downloadedValue != 0"
          :indeterminate="isSerialnumberValid && downloadedValue == 0"
          style="marginBottom: 24px"
        ></v-progress-linear>

        <p v-if="speciallyItem.length > 0">
          容量の大きいファイルは自動的にダウンロードできません。
          以下から別途ダウンロードいただけます。
          <v-row>
            <v-col v-for="item in speciallyItem" :key="item.url" cols="12" sm="6">
              <a
                :href="item.url"
                class="text-decoration-none"
                rel="noopener noreferrer"
                target="_blank"
              >
                <v-card class="mx-auto" outlined>
                  <v-list-item two-line>
                    <v-list-item-avatar tile size="40">
                      <img :src="item.artwork"
                    /></v-list-item-avatar>
                    <v-list-item-content>
                      <!-- <div class="overline mb-4">OVERLINE</div> -->
                      <v-list-item-title class=" mb-1">{{ item.name }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ (item.size / 1048576).toFixed(2) }} MB</v-list-item-subtitle
                      >
                    </v-list-item-content>

                    <v-list-item-avatar tile size="40" style="text-decoration:none ">
                      <v-tooltip v-model="tooltip" top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            @click.stop.prevent="copyToClipboard(item.url)"
                            v-bind="attrs"
                            v-on="on"
                          >
                            <v-icon>mdi-content-copy</v-icon></v-btn
                          >
                        </template>
                        <span>ダウンロードURLをコピー</span>
                      </v-tooltip>
                    </v-list-item-avatar>
                  </v-list-item></v-card
                ></a
              ></v-col
            ></v-row
          >
        </p>

        <p>
          {{ dialogText }}
        </p>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          :disabled="!(isDownloadCompleated && isZipCompleated) && isSerialnumberValid"
          class="text-body-1 text-md-h6"
          :color="$vuetify.theme.dark ? 'accent lighten-2' : 'accent'"
          text
          @click="dialog = false"
        >
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { functions } from '../firebase'
import axios from 'axios'
import streamSaver from 'streamsaver'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import platform from 'platform'

export default {
  data() {
    return {
      dialog: false,
      tooltip: false,
      tooltipMessage: 'ダウンロードURLをコピー',
      totalChunk: 0,
      loadedCunk: 0,
      zippingProgression: 0,
      isDownloadCompleated: false,
      isZipCompleated: false,
      speciallyItem: [],
      isAndroidChrome: false,
    }
  },
  methods: {
    async download() {
      // get download urls
      console.log('download')
      if (!this.isSerialnumberValid) return
      const downloadFunction = functions.httpsCallable('download')
      const data = await downloadFunction({
        serialnumber: this.serialnumber,
      }).catch(error => {
        console.log(error)
      })
      console.log(data)
      const files = data.data.files
      console.log(data.data)
      // download Process
      this.totalChunk = 0
      this.loadedCunk = 0

      this.speciallyItem = files.filter(file => file.extension == 'zip')
      // this.speciallyItem[0].url =
      //   'https://firebasestorage.googleapis.com/v0/b/kambeshi-c8022.appspot.com/o/public%2F_%E5%8B%A4%E5%8B%99%E6%99%82%E9%96%93.zip?alt=media&token=54b18c0e-a22a-425a-9d22-fa927be3d722'
      const fileteredFiles = files.filter(file => file.extension != 'zip')

      if (this.isAndroidChrome) this.downloadProcessOnAndroidChrome(fileteredFiles)
      else this.downloadProcessOnOthers(fileteredFiles)
    },

    async downloadProcessOnAndroidChrome(files) {
      // https か localhost 以外で接続すると複数ファイルダウンロードできない
      console.log('downloadProcessOnAndroidChrome')
      console.log(files)
      this.isZipCompleated = true
      const save = (file, index) => {
        return new Promise((resolve, reject) => {
          fetch(file.url).then(res => {
            // eslint-disable-next-line no-undef
            const progress = new TransformStream({
              transform: (chunk, controller) => {
                this.loadedCunk += chunk.length
                controller.enqueue(chunk)
                console.log(
                  `${index}  received: ${this.loadedCunk}(${Math.round(
                    (this.loadedCunk / this.totalChunk) * 100
                  )} %)    ${this.totalChunk}`
                )
              },
            })

            const fileStream = streamSaver.createWriteStream(
              (index + 1).toString().padStart(2, '0') + ' ' + file.name
            )
            const readableStream = res.body

            if (window.WritableStream && readableStream.pipeTo) {
              return readableStream
                .pipeThrough(progress)
                .pipeTo(fileStream)
                .then(() => {
                  console.log('done writing')
                  resolve({ ok: true, file, index })
                })
                .catch(error => {
                  reject({ ok: false, msg: 'ファイルの保存に失敗しました。', error, file, index })
                })
            } else {
              reject({
                ok: false,
                msg: 'ブラウザが対応していません。',
                isSuported: false,
                file,
                index,
              })
            }
          })
        })
      }
      Promise.all(
        files.map((file, index) => {
          this.totalChunk += Number(file.size)
          return save(file, index)
        })
      ).then(result => console.log(result))
    },

    async downloadProcessOnOthers(files) {
      console.log('downloadProcessOnOthers')
      const save = (file, index) => {
        return new Promise(resolve => {
          let preLoaded = 0
          axios({
            method: 'get',
            url: file.url,
            responseType: 'blob',
            onDownloadProgress: progressEvent => {
              const currentLoaded = progressEvent.loaded - preLoaded
              preLoaded += currentLoaded
              this.loadedCunk += currentLoaded
              console.log(
                `received(${index}):  ${this.loadedCunk}(${Math.round(
                  (this.loadedCunk / this.totalChunk) * 100
                )} %)    ${this.totalChunk}`
              )
            },
          })
            .then(response => {
              const blob = new Blob([response.data], {
                type: response.data.type,
              })
              // saveAs(blob, file.name)
              console.log('done writing')
              resolve({ ok: true, file, index, data: blob })
            })
            .catch(error => {
              console.log(index, error)
              resolve({
                ok: false,
                msg: 'ファイルの保存に失敗しました。',
                error,
                file,
                index,
                data: null,
              })
            })
        })
      }

      const zip = new JSZip()
      const zipName =
        this.type == 'single' ? this.single.name : this.type == 'package' ? this.pack.name : null
      const folder = zip.folder(zipName)

      const result = await Promise.all(
        files.map((file, index) => {
          this.totalChunk += Number(file.size)
          return save(file, index)
        })
      )
      result.forEach((result, index) => {
        folder.file((index + 1).toString().padStart(2, '0') + ' ' + result.file.name, result.data)
      })

      const blob = await zip.generateAsync({ type: 'blob' }, metadata => {
        console.log('progression: ' + metadata.percent.toFixed(2) + ' %')
        this.zippingProgression = metadata.percent
        if (metadata.currentFile) {
          console.log('current file = ' + metadata.currentFile)
        }
      })
      this.isZipCompleated = true
      saveAs(blob, zipName + '.zip')
    },
    copyToClipboard(str) {
      const d = document
      const t = d.createElement('pre')
      t.textContent = str
      d.body.appendChild(t)
      d.getSelection().selectAllChildren(t)
      d.execCommand('copy')
      d.body.removeChild(t)

      this.$nextTick(() => {
        this.tooltipMessage = 'コピーしました'
        this.tooltip = true
      })
    },
  },
  computed: {
    ...mapState([
      'serialnumber',
      'isSerialnumberValid',
      'type',
      'single',
      'downloadsRemaining',
      'downloadsCount',
    ]),
    ...mapState({ pack: state => state.package }), // 'package' is reserved name
    dialogText: function() {
      if (this.downloadsRemaining - 1 > 0)
        return `ダウンロードしたファイルを紛失してしまった場合、このシリアルナンバーで残り${this
          .downloadsRemaining - 1}回ダウンロードできます`
      else if (this.isSerialnumberValid) return ''
      else return `ダウンロード上限 (${this.downloadsCount}回) に達したため、ダウンロードできません`
    },
    dialogTitle: function() {
      if (!this.isSerialnumberValid) return 'ダウンロード上限に達しました'
      else if (!this.isDownloadCompleated) return 'ダウンロードしています'
      else if (this.isDownloadCompleated && !this.isZipCompleated) return 'ファイルをまとめています'
      else return 'ダウンロード完了'
    },
    downloadedValue: function() {
      let downloaded
      if (this.totalChunk == 0) downloaded = 0
      else downloaded = (this.loadedCunk / this.totalChunk) * 100
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      if (downloaded == 100) this.isDownloadCompleated = true
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      else this.isDownloadCompleated = false

      if (this.isAndroidChrome) return downloaded
      else return (downloaded + this.zippingProgression) / 2
    },
  },
  mounted: function() {
    if (platform.os.family == 'Android' && platform.name == 'Chrome Mobile')
      this.isAndroidChrome = true
  },
  watch: {
    dialog: function(newVal) {
      // ダウンロード完了してダイアログを閉じたときの処理
      if (!newVal && this.isSerialnumberValid) {
        this.$store.dispatch('decrementDownloadsRemaining')
        this.$store.dispatch('incrementDownloadCountInSession')
        this.isDownloadCompleated = false
        this.isZipCompleated = false
      }

      const onBeforeunload = () => {
        console.log('beore unload')
        this.dialog = false
      }

      if (newVal) {
        window.addEventListener('beforeunload', onBeforeunload)
      } else {
        window.removeEventListener('beforeunload', onBeforeunload)
      }
    },
    tooltip: function(newVal) {
      if (!newVal) this.tooltipMessage = 'ダウンロードURLをコピー'
    },
  },
}
</script>
