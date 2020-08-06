const admin = require('firebase-admin')

const serviceAccount = require('./.key/kambeshi-c8022-firebase-adminsdk-ap4b8-79c9eedccb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kambeshi-c8022.firebaseio.com',
})

const db = admin.firestore()

// ---------- SETTING ----------
const name = 'AWESOME SINGLE'
const artist = 'AWESOME ARTIST'
const artwork = 'https://i.gyazo.com/bdcdc96bc5334cea9487acf283a2a641.jpg'
const data = 'AWESOME_FILE.txt'
const releaseDate = new Date('2020/08/01')
// ---------- SETTING ----------
const publicRef = db.collection('single/info/public')
const privateRef = db.collection('single/info/private')

const registerSingle = () => {
  publicRef
    .add({ name, artist, artwork, releaseDate })
    .then(docRef => {
      console.log(docRef.id)
      privateRef.doc(docRef.id).set({ data })
    })
    .catch(e => {
      console.log(e)
    })
}

registerSingle()
