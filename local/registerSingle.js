const admin = require('firebase-admin')

const serviceAccount = require('./.key/kambeshi-c8022-firebase-adminsdk-ap4b8-79c9eedccb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kambeshi-c8022.firebaseio.com',
})

const db = admin.firestore()

// ---------- SETTING ----------
const name = [
  'AWESOME SINGLE A',
  'AWESOME SINGLE B',
  'AWESOME SINGLE C',
  'AWESOME SINGLE D',
  'AWESOME SINGLE E',
  'AWESOME SINGLE F',
  'AWESOME SINGLE G',
  'AWESOME SINGLE H',
  'AWESOME SINGLE I',
  'AWESOME SINGLE J',
]
const artist = 'Awesome Artist'
const artwork =
  'https://firebasestorage.googleapis.com/v0/b/kambeshi-c8022.appspot.com/o/public%2Fpackage%2Ftest%2FAWESOME_SINGLE.jpg?alt=media&token=2d5a1c17-1196-4c64-9b8e-8c11ccff5d8a'
const data = 'private/package/test/'
const releaseDate = new Date('2020/09/06')
// ---------- SETTING ----------
const publicRef = db.collection('single/info/public')
const privateRef = db.collection('single/info/private')

const registerSingle = async name => {
  const docRef = await publicRef.add({ name, artist, artwork, releaseDate })

  privateRef.doc(docRef.id).set({ data: `${data}${name}.mp3` })
  console.log(`'${docRef.id}',`)
  return { id: `'${docRef.id}',` }
}

const func = async () => {
  const promises = name.map(n => registerSingle(n))
  const result = await Promise.all(promises)
  result.forEach(r => console.log(r.id))
}

func()
