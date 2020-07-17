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
    let newSerialnumber
    do {
      newSerialnumber = zeroPadding(Math.floor(Math.random() * max), digit)
    } while (existingSerialnumbers.includes(newSerialnumber))
    existingSerialnumbers.push(newSerialnumber)
    batch.set(serialnumberRef.doc(newSerialnumber), values)

    // 500件ごとにコミット
    if ((i + 1) % 500 === 0) {
      commit()
      batch = db.batch()
    }
  }
  commit()
}

const commit = () => {
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

// ========================================

const serialnumberRef = db.collection('serialnumber')
let batch = db.batch()

// 既存のシリアルナンバーを取得
const existingSerialnumbers = []
serialnumberRef.get().then(snapshot => {
  snapshot.forEach(doc => {
    existingSerialnumbers.push(doc.id)
  })
  console.log('existing serialnumbers size:  ', snapshot.size)
  generateSerialnumber()
})
