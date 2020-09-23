const admin = require('firebase-admin')
const fs = require('fs')

const serviceAccount = require('./.key/kambeshi-c8022-firebase-adminsdk-ap4b8-79c9eedccb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kambeshi-c8022.firebaseio.com',
})

const db = admin.firestore()

// ---------- SETTING ----------
const quantity = 1 //シリアルナンバー作成数
const digit = 8 //シリアルナンバーのケタ数
const type = 'package' //'single' or 'package'
const downloadsCount = 0 //0 ダウンロード数
const downloadsRemaining = 3 //ダウンロード可能回数
const contents = db.doc('/package/X3SRpZjj6XCxl46zDay0') //'single' か 'package'のRef
const isTest = true // テスト用のシリアルナンバーかどうか
const tag = 'demo' // 任意のタグ
// ---------- SETTING ----------
const baseUrl = 'https://download.shunhiro.com/serialnumber/'

const generateSerialnumber = () => {
  const generatedSerialnumbers = []
  const max = Math.pow(10, digit)

  const values = {
    type,
    downloadsCount,
    downloadsRemaining,
    contents: contents,
    createdDate: admin.firestore.FieldValue.serverTimestamp(),
    updatedDate: admin.firestore.FieldValue.serverTimestamp(),
    isTest,
    tag,
  }

  for (let i = 0; i < quantity; i++) {
    let newSerialnumber
    do {
      newSerialnumber = zeroPadding(Math.floor(Math.random() * max), digit)
    } while (existingSerialnumbers.includes(newSerialnumber))
    existingSerialnumbers.push(newSerialnumber)
    generatedSerialnumbers.push(newSerialnumber)
    batch.set(serialnumberRef.doc(newSerialnumber), values)

    // 500件ごとにコミット
    if ((i + 1) % 500 === 0) {
      commit()
      batch = db.batch()
    }
  }
  commit()
  return generatedSerialnumbers
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

const formatDate = date => {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date
    .getDate()
    .toString()
    .padStart(2, '0')
  const h = date
    .getHours()
    .toString()
    .padStart(2, '0')
  const min = date
    .getMinutes()
    .toString()
    .padStart(2, '0')
  return y + '-' + m + '-' + d + '-' + h + '-' + min
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
  const generatedSerialnumbers = generateSerialnumber()
  const file = fs.createWriteStream(`serialnumber_${formatDate(new Date())}.csv`)
  file.write(`Serialnumber,#URL\n`)
  generatedSerialnumbers.forEach(sn => {
    console.log(sn.toString().substring(0, 4) + ' ' + sn.toString().substring(4))
    file.write(
      `${sn.toString().substring(0, 4)} ${sn.toString().substring(4)},${baseUrl}${sn.toString()}\n`
    )
  })
  file.end()
})
