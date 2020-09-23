const admin = require('firebase-admin')

const serviceAccount = require('./.key/kambeshi-c8022-firebase-adminsdk-ap4b8-79c9eedccb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kambeshi-c8022.firebaseio.com',
})

const db = admin.firestore()

// ---------- SETTING ----------
const name = 'AWESOME ALBUM'
const artist = 'Awesome Artist'
const artwork =
  'https://firebasestorage.googleapis.com/v0/b/kambeshi-c8022.appspot.com/o/public%2Fpackage%2Ftest%2FAWESOME_ALBUM.jpg?alt=media&token=fe83c4a9-5540-4fc7-8dff-12b79a6dc8cc'
const contents = [
  'vLfQABxIOwGyO80b3Tts',
  'mFBEmyDLKwGg1vDrBUf6',
  'brDzXqYsSzb2Y4GnPwni',
  't1bP78DvVJ03XklAQSsK',
  'IqylBTDVwW5o9yZ48xL1',
  'CTlQ6n9NnHv3tcF1GO5A',
  '5tPkOf6NMvA2JriiVW6d',
  'CWMGoQKyMDMY72k9iMzn',
  'ZoypCzRji8pM26Xnsiia',
  'qUUKm61nCUw59IsJy00I',
]
const releaseDate = new Date('2020/09/06')
// ---------- SETTING ----------

const packageRef = db.collection('package')

const registerPackage = async () => {
  const docRef = await packageRef.add({
    name,
    artist,
    artwork,
    releaseDate,
    contents: contents.map(e => db.doc('single/info/public/' + e)),
  })
  console.log(docRef.id)
}

registerPackage()
