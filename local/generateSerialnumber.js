const admin = require('firebase-admin')

const serviceAccount = require('./.key/kambeshi-c8022-firebase-adminsdk-ap4b8-79c9eedccb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kambeshi-c8022.firebaseio.com',
})

const db = admin.firestore()

// ---------- SETTING ----------
const quantity = 3 //シリアルナンバー作成数
const digit = 8 //シリアルナンバーのケタ数
const type = 'single' //'single' or 'package'
const downloadsCount = 0 //0 ダウンロード数
const downloadsRemaining = 3 //ダウンロード可能回数
const contents = db.doc('/single/info/public/I55IZXrYMcDBC0TDSFCP') //'single' か 'package'のRef
// ---------- SETTING ----------

const serialnumberRef = db.collection('serialnumber')
const batch = db.batch()

const generateSerialnumber = () => {
  const max = Math.pow(10, digit)

  const values = {
    type,
    downloadsCount,
    downloadsRemaining,
    contents: contents,
    createdDate: admin.firestore.FieldValue.serverTimestamp(),
    updatedDate: admin.firestore.FieldValue.serverTimestamp(),
  }
  for (let i = 0; i < quantity; i++) {
    const val = zeroPadding(Math.floor(Math.random() * max), digit)
    batch.set(serialnumberRef.doc(val), values)
  }
  batch
    .commit()
    .then(info => {
      console.log(info)
    })
    .catch(err => {
      console.log(err)
    })
}

const zeroPadding = (num, len) => {
  return (Array(len).join('0') + num).slice(-len)
}

generateSerialnumber()
