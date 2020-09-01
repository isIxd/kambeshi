import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import ja from 'vuetify/es5/locale/ja'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    // dark: true,
    themes: {
      // background を変更する場合はCSSも変更する
      dark: {
        primary: '#2C3136',
        accent: '#1A5F53',
        secondary: '#795548',
        success: '#4CAF50',
        info: '#2196F3',
        warning: '#FB8C00',
        error: '#FF5252',
        background: '#121212',
      },
      light: {
        primary: '#404142',
        accent: '#26A69A',
        secondary: '#795548',
        success: '#4CAF50',
        info: '#2196F3',
        warning: '#FB8C00',
        error: '#FF5252',
        background: '#FFFFFF',
      },
    },
  },
  lang: {
    locales: { ja },
    current: 'ja',
  },
  icons: {
    iconfont: 'mdi',
  },
})
