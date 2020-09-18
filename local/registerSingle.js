const admin = require('firebase-admin')

const serviceAccount = require('./.key/kambeshi-c8022-firebase-adminsdk-ap4b8-79c9eedccb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kambeshi-c8022.firebaseio.com',
})

const db = admin.firestore()

// ---------- SETTING ----------
const name = [
  'May Be Blues',
  'whisper',
  'ほほえみ',
  'テジナ',
  '迷いの風',
  '黄色線',
  'ENDLESS',
  '声',
  'そういうことなのさ',
  '足を止めるから',
]
const artist = 'shunhiro'
const artwork =
  'https://firebasestorage.googleapis.com/v0/b/kambeshi-c8022.appspot.com/o/public%2Fpackage%2Fopen%20your%20path%2Fopen%20your%20path_artwork.png?alt=media&token=2aed185f-2954-4b0c-b192-aabcafdda433'
const data = 'private/package/open your path/'
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
