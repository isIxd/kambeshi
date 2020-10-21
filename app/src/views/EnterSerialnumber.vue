<template>
  <v-container fill-height>
    <v-row
      ><v-col cols="12" align="center">
        <p style="margin:0 auto;" class="text-h6 text-sm-h5">
          シリアルナンバーを入力してください
        </p>
      </v-col>
      <v-col cols="12" no-gutters id="serialFormRow">
        <v-row class="ma-0">
          <v-col
            id="serialForm"
            v-for="(item, index) in intaractiveSerialnumber"
            :key="item.order"
            class="pa-0 my-12"
          >
            <v-text-field
              color="accent"
              hide-details
              ref="input"
              v-model.number="item.value"
              @input="checkInput(index)"
              @keydown="checkKeydown(index, $event)"
              :height="$vuetify.breakpoint.name == 'xs' ? '60px' : '90px'"
              outlined
              class="pa-0"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" align="center" style="position: relative">
        <p
          style="margin:0 auto; width:100%;"
          class="text-caption text-sm-subtitle-1 validation-result-message"
          :style="{
            transform: `translateX(-50%) translateY(-${$vuetify.breakpoint.xs ? 250 : 180}%)`,
            color:
              $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'][
                validationMessage.color
              ],
          }"
        >
          {{ validationMessage.text }}
        </p>
        <v-btn
          color="accent"
          ref="btn"
          :disabled="!serialnumberExists"
          x-large
          style="margin: 0 auto"
          :loading="isValidating"
          ripple
          :to="{ path: '/download' }"
        >
          ダウンロードへ進む</v-btn
        >
      </v-col></v-row
    >
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { mapState } from 'vuex'
import { user } from '../firebase/index'
import favicon from '@/assets/favicon.svg'

export default {
  name: 'EnterSerialnumber',
  metaInfo() {
    return {
      title: 'Enter A Serialnumber |',
      link: [
        {
          rel: 'icon',
          href: favicon,
        },
      ],
    }
  },
  data: () => ({
    intaractiveSerialnumber: [
      { order: 0, value: '' },
      { order: 1, value: '' },
      { order: 2, value: '' },
      { order: 3, value: '' },
      { order: 4, value: '' },
      { order: 5, value: '' },
      { order: 6, value: '' },
      { order: 7, value: '' },
    ],
    isValidating: false,
    validationMessage: { text: '', color: 'info' },
  }),
  methods: {
    ...mapActions(['setSerialnumber', 'validateSerialnumber']),
    fullWidth2halfWidth: function(str) {
      if (str.length < 1) return ''
      return str.toString().replace(/[０-９]/g, s => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
      })
    },
    checkKeydown: function(index, e) {
      if (e.key != 'Backspace') return
      this.$nextTick(() => {
        if (index != 0) {
          this.$set(this.intaractiveSerialnumber[index], 'value', '')
          this.$refs.input[index - 1].focus()
        }
      })
    },
    checkInput: function(index) {
      this.validationMessage.text = ''
      // 全角数字を半角数字に
      // 2ケタ以上の場合は最後の数値
      let target = this.fullWidth2halfWidth(this.intaractiveSerialnumber[index].value.toString())
        .toString()
        .slice(-1)

      if (target == '') return
      // 数値を上書き
      this.$nextTick(async () => {
        this.$set(this.intaractiveSerialnumber[index], 'value', target)
        // 8文字入力したらバリデーション
        if (
          this.intaractiveSerialnumber.every(item => {
            if (item.value == undefined) return false
            else return item.value.toString().match(/[0-9]/)
          })
        ) {
          this.setSerialnumber(
            this.intaractiveSerialnumber.reduce((acc, item) => acc + item.value, '')
          )
          this.validate()
        }
      })
      // 次のinputをフォーカス
      if (index < this.intaractiveSerialnumber.length - 1) {
        this.$refs.input[index + 1].focus()
      }
    },
    validate: async function() {
      this.isValidating = true
      this.setValidationMessage('シリアルナンバーを確認しています。', 'info')
      const response = await this.validateSerialnumber()
      if (Object.prototype.hasOwnProperty.call(response, 'isResourceExhausted')) {
        this.setValidationMessage('しばらくしてからもう一度お試しください。', 'error')
      } else if (Object.prototype.hasOwnProperty.call(response, 'isPermissionDenied')) {
        this.setValidationMessage('認証に失敗しました。再読み込みしてください。', 'error')
      } else if (response.serialnumberExists) {
        this.setValidationMessage('', 'info')
        this.$refs.btn.$el.focus()
      } else {
        this.setValidationMessage('不正なシリアルナンバーです。', 'error')
        this.$refs.input[this.$refs.input.length - 1].focus()
      }
      this.isValidating = false
    },
    setIntaractiveSerialnumber: function(newSerialnumber) {
      newSerialnumber
        .toString()
        .split('')
        .forEach((digit, index) => {
          this.$set(this.intaractiveSerialnumber[index], 'value', digit)
        })
    },
    setValidationMessage: function(text, color) {
      this.$set(this.validationMessage, 'text', text)
      this.$set(this.validationMessage, 'color', color)
    },
  },
  computed: {
    ...mapState(['serialnumber', 'serialnumberExists']),
  },
  mounted: async function() {
    // DOMの処理
    this.$refs.input.forEach(input => {
      input.$el.querySelector('input').setAttribute('type', 'tel')
    })

    // params にシリアルナンバーがあったときの処理
    if (this.$route.params.serialnumber && this.$route.params.serialnumber.toString().length > 0) {
      this.setSerialnumber(
        this.$route.params.serialnumber
          .toString()
          .split('')
          .reduce((acc, digit) => {
            return acc + this.fullWidth2halfWidth(digit)
          }, '')
      )
      if (user) this.validate()
      else {
        const validateLater = () => {
          setTimeout(() => {
            if (user) this.validate()
            else validateLater()
          }, 50)
        }
        validateLater()
      }
    }

    // 前のページから戻ったときの処理
    if (this.serialnumberExists) {
      this.setIntaractiveSerialnumber(this.serialnumber)

      this.$refs.input[this.$refs.input.length - 1].focus()
    } else {
      this.$refs.input[0].focus()
    }
  },
  watch: {
    serialnumber: function(newVal) {
      console.log(newVal)
      this.setIntaractiveSerialnumber(newVal)
      try {
        this.$router.replace({ params: { newVal } })
      } catch (e) {
        console.log(e)
      }
    },
  },
}
</script>

<style lang="sass">
$breakpoint-down: ('bp620': 'screen and (max-width: 619px)')

=mq-down($breakpoint)
  @media #{map-get($breakpoint-down, $breakpoint)}
    @content

#serialFormRow
  max-width: 600px
  width: 100%
  margin: 0 auto
  > div
    display: flex
#serialForm
  margin: 0 4px
  +mq-down (bp620)
    margin: 0 2px
  .v-input__slot
    padding: 0 !important
  input
    text-align: center
    font-size: 32px
    caret-color: transparent
.validation-result-message
  position: absolute
  top: 0
  left: 50%
.v-input input
  max-height: initial !important
</style>
