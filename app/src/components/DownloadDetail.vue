<template>
  <v-dialog v-model="dialog" persistent max-width="800">
    <template v-slot:activator="{ on, attrs }">
      <slot name="btn" v-bind:dialogProps="{ on, attrs }"> </slot>
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
import streamSaver from 'streamsaver'

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
      this.totalChunk = 0
      this.loadedCunk = 0
      console.log('download')
      const downloadFunction = firebase.functions().httpsCallable('download')
      const data = await downloadFunction({
        serialnumber: this.serialnumber,
      }).catch(error => {
        console.log(error)
      })

      console.log(data.data)

      const save = (file, index) => {
        return new Promise((resolve, reject) => {
          fetch(file.url).then(res => {
            let reader = res.body.tee()

            const progressReader = reader[0].getReader()
            const readProgress = result => {
              // done が true なら最後の chunk
              if (result.done) {
                return
              }
              this.loadedCunk += result.value.length
              console.log(
                `${index}  received: ${this.loadedCunk}(${Math.round(
                  (this.loadedCunk / this.totalChunk) * 100
                )} %)    ${this.totalChunk}`
              )
              return progressReader.read().then(readProgress)
            }
            progressReader.read().then(readProgress)

            const fileStream = streamSaver.createWriteStream(file.name)
            const readableStream = reader[1]

            if (window.WritableStream && readableStream.pipeTo) {
              return readableStream
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
        data.data.files.map((file, index) => {
          this.totalChunk += Number(file.size)
          return save(file, index)
        })
      )
        .then(result => console.log(result))
        .catch(error => console.error(error))
    },
  },
  mounted() {},
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
      if (newVal) this.download()
      // 閉じたときの処理
      else {
        this.$store.dispatch('decrementDownloadsRemaining')
        this.$store.dispatch('incrementDownloadCountInSession')
      }
    },
  },
}
</script>
