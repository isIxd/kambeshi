const admin = require('firebase-admin')

const serviceAccount = require('./.key/kambeshi-c8022-firebase-adminsdk-ap4b8-79c9eedccb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kambeshi-c8022.firebaseio.com',
})

const db = admin.firestore()

// ---------- SETTING ----------
const name = 'open your path'
const artist = 'shunhiro'
const artwork =
  'https://firebasestorage.googleapis.com/v0/b/kambeshi-c8022.appspot.com/o/public%2Fpackage%2Fopen%20your%20path%2Fopen%20your%20path_artwork.png?alt=media&token=2aed185f-2954-4b0c-b192-aabcafdda433'
const contents = [
  'fIFkIUprIXbWTUhyKQx6',
  'YajSRrONYNEIyZTVxk2j',
  'aAx8lfmZx6EelHxjGWNR',
  'Ch3ucBxQo1WYi0HQKhZE',
  'wMooyqTm9MJmfR2jU8vz',
  'OJdVoxNUDuMMwF8MavkJ',
  'ydKhriqo9H7l2qpmUuUC',
  'lI9saEm0N9eYIFDXs80c',
  'GHKym3GBkfsFqhMuLdGZ',
  'wvI5AtU673F3Hnqnl2pk',
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
