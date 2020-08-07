import ENV from './firebaseConfig.env.json'
import firebase from 'firebase'
import 'firebase/firestore'

firebase.initializeApp({
  apiKey: ENV.apiKey,
  authDomain: ENV.authDomain,
  projectId: ENV.projectId,
})

const db = firebase.firestore()

const validateSerialnumber = async serialnumber => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = await db.doc(`serialnumber/${serialnumber}`).get()
      const data = snapshot.data()
      if (data) {
        resolve(data)
      } else {
        reject('invalid')
      }
    } catch (err) {
      reject(err)
    }
  })
}

const getPackageData = async packageRef => {
  const snapshot = await packageRef.get()
  const data = snapshot.data()
  const singles = await Promise.all(data.contents.map(singleRef => getSingleData(singleRef)))
  return { ...data, contents: singles }
}

const getSingleData = async singleRef => {
  const snapshot = await singleRef.get()
  return await snapshot.data()
}

export { firebase, db, validateSerialnumber, getPackageData, getSingleData }
