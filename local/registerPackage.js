const admin = require('firebase-admin')

const serviceAccount = require('./.key/kambeshi-c8022-firebase-adminsdk-ap4b8-79c9eedccb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kambeshi-c8022.firebaseio.com',
})

const db = admin.firestore()

// ---------- SETTING ----------
const name = 'AWESOME ALBUM'
const artist = 'AWESOME ARTIST'
const artwork = 'https://gyazo.com/46714b95056cfb0e3a1f1e2686fdf130.jpg'
const contents = [
  '3zQvd9QWjxZBDRnFfuHs',
  '9aJlxnj1LTgZTVtR2r6x',
  'At2U6aLSqbJrDWWbqzWl',
  'NJCmV3Ph2ILRe9gyYVjI',
  'USTyxeC94sVWP4Lzxluw',
  'bYGq8Y6KsDGsUe1OoeDW',
  'iPK7F5GHXDFzF0rOxFdw',
  'u5x3H609qiVfSeke41nW',
  'uLFbfV02LtnZXosqfbfB',
  'vNInobNJB8tY8JaHIV4t',
]
const releaseDate = new Date('2020/08/01')
// ---------- SETTING ----------

const packageRef = db.collection('package')

const registerPackage = () => {
  packageRef
    .add({
      name,
      artist,
      artwork,
      releaseDate,
      contents: contents.map(e => db.doc('single/info/public/' + e)),
    })
    .then(docRef => {
      console.log(docRef.id)
    })
    .catch(e => {
      console.log(e)
    })
}

registerPackage()
