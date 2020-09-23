# Download with Serialnumber

![](https://pro2-bar-s3-cdn-cf5.myportfolio.com/e1f236c2-c54d-4ef9-88aa-68d8e06dfb53/6a1e51e2-7b92-42e2-908a-f6c7045888b8_rw_1920.png?h=17ebdad9bb7ee07c2ff2c8be5719967d)

## Adout

An application that allows you to download content by entering a serial number

シリアルナンバーを入力してコンテンツをダウンロードできるアプリケーション

8 ケタのシリアルナンバーに対応しています。(シリアルナンバーを 10000 件発行すると 0.01%の確率で適当に打ち込んだシリアルナンバーがヒットします。)

### Demo

[Page] https://download.shunhiro.com/serialnumber/36665669

[Serialnumber] 3666 5669

---

## Project Structure

### Frontend

#### Library

- Vue.js
- Vuex
- Vue Router
- Vue Meta
- Vuetify

#### Pages

1. シリアルナンバー入力画面: `<BASE_URL>/serialnumber/:serialnumber?`

   e.g. `example.com/serialnumber`, `example.com/serialnumber/12345678` (auto complete)

1. ダウンロード画面: `<BASE_URL>/download`

   e.g. `example.com/download`

### Firebase

#### Cloud Firestore

- API のログ
- API 制限設定
- シリアルナンバー
- (シングルの)パッケージのデータ
- シングル(コンテンツ)のデータ

#### Cloud Functions

- シリアルナンバーの照合
- ダウンロード URL 発行

#### Cloud Storage

- シングル(コンテンツ)のデータ

#### Hosting

- ホスティング

---

## Project setup

- `firebase-tools`の導入
  ```
  npm i -g firebase-tools
  ```

* Firebase プロジェクトの作成
* Hosting、Cloud Firestore、Cloud Functions、Cloud Storage を有効化
* `./app/src/firebase/firebaseConfig.env.json` に Firebase 構成ファイルを作成
* Cloud Functions の環境変数にコンテンツを保存している Cloud Storage バケットの名前を登録

  ```
  firebase functions:config:set bucket.name="<your-bucket-name / maybe project-id.appspot.com>"
  ```

* API 制限設定を Cloud Firestore に登録

  - `api/settings/type/download`と `api/settings/type/download`にそれぞれ以下を設定
    ```
    {
      count: Number | 単位時間あたりの呼び出し可能回数
      limiteMinutes: Number | 単位時間(分)
    }
    ```

* npm install

  ```
  npm install
  ```

---

## Register Contents & Generate Serialnumber

### Database structure

データベースは以下の構造になっています

[PRIVATE][public] はクライアント SDK からアクセスできるかどうかを示しています。これは `./firestore.rules` で変更できます。

- `serialnumber/:serialnumber` [PRIVATE]

  ```
  {
    type: String | `single` / `package`
    downloadsCount: Number | ダウンロード回数
    downloadsRemaining: Number | ダウンロード残り回数
    contents: Reference | シングルもしくはパッケージのDocumentのReference
    createdDate: Timestamp | 作成日
    updatedDate: Timestamp | アップデートされた日
    isTest: Boolean | テスト用のシリアルナンバーかどうか
    tag: String | 任意のタグ(検索用)
  }
  ```

- `single/info`
  - `public/:singleId` [PUBLIC]
    ```
    {
      name: String | タイトル
      artwork: String | 画像URL
      artist: String | アーティスト名
      releaseDate: Timestamp | リリース日
    }
    ```
  - `private/:singleId` [PRIVATE]
    ```
    {
      data: String | Storageのパス
    }
    ```
- `package/:packageId` [PUBLIC]

  ```
  {
    name : String | アルバム名
    artwork: String | URL
    artist: String | アーティスト名(パブリッシャ)
    contents: Object | :singleIdのDocumentのリファレンスのオブジェクト
    releaseDate: Timestamp | リリース日
  }
  ```

### How to Register

半自動で登録できるプログラム ( `registerSingle.js` `registerPackage.js` ) が`./local`内にあります。

1. Cloud Storage にコンテンツのデータを置く
2. `registerSingle.js` でシングルを登録する
3. パッケージの場合は、先程のシングルを `registerPackage.js` でパッケージに登録

note. Cloud Storage の`public/`フォルダはクライアント SDK からアクセスできます。これは `./storage.rules` で変更できます。

### How to Generate serialnumber

登録したシングルまたは、パッケージに紐付けたシリアルナンバーを `generateSerialnumber.js` で生成できます。

---

## Development

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
firebase deploy
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
