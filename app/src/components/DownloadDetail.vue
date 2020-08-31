<template>
  <v-dialog v-model="dialog" persistent max-width="800">
    <template v-slot:activator="{ on, attrs }">
      <slot name="btn" v-bind:dialogProps="{ on, attrs }" v-bind:download="download"> </slot>
    </template>

    <v-card>
      <v-card-title class="headline text-center" style="text-align:center">
        <span v-if="isDownloadCompleated">ダウンロードが完了しました</span>
        <span v-else>ダウンロードしています</span>
      </v-card-title>

      <v-card-text>
        <p></p>
        <v-progress-linear
          v-model="downloadedValue"
          :buffer-value="downloadedValue"
          :value="downloadedValue"
          color="deep-purple accent-4"
          height="16px"
          rounded
          :stream="downloadedValue != 0"
          :indeterminate="downloadedValue == 0"
        ></v-progress-linear>
        <p></p>
        <p>
          {{ dialogText }}
        </p>
        <p>ダウンロードが上手くいかない場合は<a href="#">コチラ</a>からお問い合わせください</p>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          :disabled="!isDownloadCompleated"
          color="green darken-1"
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
import { firebase } from '../firebase'
import axios from 'axios'
import streamSaver from 'streamsaver'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import platform from 'platform'

export default {
  data() {
    return {
      dialog: false,
      totalChunk: 0,
      loadedCunk: 0,
      isDownloadCompleated: false,
    }
  },
  methods: {
    async download() {
      // get download urls
      console.log('download')
      const downloadFunction = firebase.functions().httpsCallable('download')
      const data = await downloadFunction({
        serialnumber: this.serialnumber,
      }).catch(error => {
        console.log(error)
      })
      const files = data.data.files
      console.log(data.data)
      // download Process
      this.totalChunk = 0
      this.loadedCunk = 0
      if (platform.os.family == 'Android' && platform.name == 'Chrome Mobile')
        this.downloadProcessOnAndroidChrome(files)
      else this.downloadProcessOnOthers(files)
    },

    async downloadProcessOnAndroidChrome(files) {
      // https か localhost 以外で接続すると複数ファイルダウンロードできない
      console.log('downloadProcessOnAndroidChrome')
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

            const fileStream = streamSaver.createWriteStream(file.name)
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
      result.forEach(result => {
        folder.file(result.file.name, result.data)
      })

      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, zipName)
    },
  },
  mounted() {
    console.log(platform)
  },
  computed: {
    ...mapState(['serialnumber', 'isSerialnumberValid', 'type', 'single', 'downloadsRemaining']),
    ...mapState({ pack: state => state.package }), // 'package' is reserved name
    dialogText: function() {
      if (this.downloadsRemaining - 1 > 0) {
        return `ダウンロードしたファイルを紛失してしまった場合、このシリアルナンバーで残り${this
          .downloadsRemaining - 1}回ダウンロードできます`
      } else {
        return ''
      }
    },
    downloadedValue: function() {
      let result
      if (this.totalChunk == 0) result = 0
      else result = (this.loadedCunk / this.totalChunk) * 100
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      if (result == 100) this.isDownloadCompleated = true
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      else this.isDownloadCompleated = false
      return result
    },
  },

  watch: {
    dialog: function(newVal) {
      // ダイアログが開いたときの処理
      if (newVal) {
        //
      }
      // 閉じたときの処理
      else {
        this.$store.dispatch('decrementDownloadsRemaining')
        this.$store.dispatch('incrementDownloadCountInSession')
      }
    },
  },
}
</script>
