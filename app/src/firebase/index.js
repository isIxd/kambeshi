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
      const data = await db.doc(`serialnumber/${serialnumber}`).data()
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
  const data = await packageRef.get().data()
  const singles = await Promise.all(data.contents.map(singleRef => getSingleData(singleRef)))
  return { ...data, contents: singles }
}

const getSingleData = async singleRef => {
  return await singleRef.get().data()
}

export { firebase, db, validateSerialnumber, getPackageData, getSingleData }
