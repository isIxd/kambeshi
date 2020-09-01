<template>
  <v-app>
    <v-app-bar app color="primary" dark fixed>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="./assets/favicon.svg"
          transition="scale-transition"
          width="40"
        />
        <v-toolbar-title class="ml-2">Download with SN</v-toolbar-title>
      </div>

      <v-spacer></v-spacer>

      <v-dialog v-model="dialog" max-width="800">
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            <v-icon> mdi-information-outline</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="text-center text-h6 text-md-h4"
            >このアプリケーションについて</v-card-title
          >
          <v-card-text class="text-body-2 text-md-h6">
            <p></p>
            <p>
              このアプリケーションでは、シリアルナンバーを入力してメディアをダウンロードできます。
            </p>
            <p>
              ダウンロードが上手くいかない場合は<a
                href="https://docs.google.com/forms/d/e/1FAIpQLScwSAHdOBM9sVOPPNfLpji79HKwOZcbJvMBgIPQOTEXO9NWhA/viewform"
                target="newtab"
                :style="{
                  color: $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].secondary,
                }"
                >コチラ</a
              >からお問い合わせください
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              class="text-body-1 text-md-h6"
              :color="$vuetify.theme.dark ? 'accent lighten-2' : 'accent'"
              text
              @click="dialog = false"
              >閉じる</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  metaInfo() {
    return {
      title: '',
      titleTemplate: '%s Download with SN',
    }
  },
  data() {
    return { dialog: false }
  },
  mounted() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) this.$vuetify.theme.dark = true
  },
}
</script>

<style lang="sass">
body
  height: 100vh
  overflow: hidden
</style>
