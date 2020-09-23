import ENV from './firebaseConfig.env.json'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

firebase.initializeApp({
  apiKey: ENV.apiKey,
  authDomain: ENV.authDomain,
  projectId: ENV.projectId,
})

firebase
  .auth()
  .signInAnonymously()
  .catch(error => {
    console.log(error)
  })

const db = firebase.firestore()
const functions = firebase.app().functions('asia-northeast1')

const convertToFirestore = arg => {
  if (arg instanceof Array) {
    const result = []
    arg.forEach(elm => {
      result.push(convertToFirestore(elm))
    })
    return result
  } else if (arg instanceof Object) {
    // eslint-disable-next-line no-prototype-builtins
    if (arg.hasOwnProperty('__isFirebaseObject')) {
      const db = firebase.firestore()
      switch (arg.type) {
        case 'DocumentReference':
          return db.doc(arg.path)
        case 'CollectionReference':
          return db.collection(arg.path)
        case 'Timestamp':
          return firebase.firestore.Timestamp.fromDate(new Date(arg.time))
      }
    }
    const result = {}
    Object.keys(arg).forEach(elm => {
      result[elm] = convertToFirestore(arg[elm])
    })
    return result
  } else {
    return arg
  }
}

const validateSerialnumber = async serialnumber => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const validateFunction = functions.httpsCallable('validateSerialnumber')
    const result = await validateFunction({
      serialnumber,
    }).catch(error => {
      reject(error)
    })

    if (result.data.isValid) {
      const rawData = result.data.data
      resolve(convertToFirestore(rawData))
    } else {
      reject('invalid')
    }
  })
}

const getPackageData = async packageRef => {
  const snapshot = await packageRef.get()
  const data = snapshot.data()
  const singles = await Promise.all(data.contents.map(singleRef => getSingleData(singleRef)))
  return { ...data, contents: singles, id: packageRef.id }
}

const getSingleData = async singleRef => {
  const snapshot = await singleRef.get()
  return await {
    ...snapshot.data(),
    id: singleRef.id,
  }
}

export { functions, db, validateSerialnumber, getPackageData, getSingleData }
