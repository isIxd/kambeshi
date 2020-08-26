const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, '/app/src'), // 1. @の参照先の変更
      },
    },
  },
  outputDir: 'app/dist', // 2. 出力先
  pages: {
    index: {
      entry: 'app/src/main.js', // エントリーポイント
      template: 'app/public/index.html', //3. index.htmlテンプレート
      filename: 'index.html', // 省略可
    },
  },
}
