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
            v-for="(item, index) in serialnumber"
            :key="item.order"
            class="pa-0 my-12"
          >
            <v-text-field
              hide-details
              ref="input"
              v-model.number="item.value"
              @input="checkInput(index)"
              :autofocus="index == 0"
              :height="$vuetify.breakpoint.name == 'xs' ? '60px' : '90px'"
              outlined
              class="pa-0"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" align="center">
        <v-btn ref="btn" :disabled="!entered" @click="submit" x-large style="margin: 0 auto">
          ダウンロードへ進む</v-btn
        >
      </v-col></v-row
    >
  </v-container>
</template>

<script>
export default {
  data: () => ({
    serialnumber: [
      { order: 0, value: '' },
      { order: 1, value: '' },
      { order: 2, value: '' },
      { order: 3, value: '' },
      { order: 4, value: '' },
      { order: 5, value: '' },
      { order: 6, value: '' },
      { order: 7, value: '' },
    ],
  }),
  methods: {
    fullWidth2halfWidth: function(str) {
      return str.toString().replace(/[０-９]/g, s => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
      })
    },
    checkInput: function(index) {
      // 全角数字を半角数字に
      // 2ケタ以上の場合は最後の数値
      let target = this.fullWidth2halfWidth(this.serialnumber[index].value)
        .toString()
        .slice(-1)
      // 数値を上書き
      this.$nextTick(() => {
        this.serialnumber[index].value = target
      })
      // 次のinputをフォーカス
      if (index < this.serialnumber.length - 1) {
        this.$refs.input[index + 1].focus()
      }
    },
    submit: function() {
      // @TODO: Vuex, Vue-Router
      console.log('submit')
    },
  },
  computed: {
    entered: function() {
      return this.serialnumber.every(item => item.value > 0)
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
</style>
