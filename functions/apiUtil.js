const { functions, admin, db } = require('./firebase.js')

const checkAuth = context => {
  // eslint-disable-next-line no-prototype-builtins
  if (context.hasOwnProperty('auth')) {
    return
  } else {
    throw new functions.https.HttpsError('permission-denied', 'You must authenticate')
  }
}

const checkArgments = data => {
  const re = /^[0-9]{8}$/

  if (data.serialnumber && typeof data.serialnumber == 'string' && re.test(data.serialnumber)) {
    return
  } else {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with 8 digit serialnumber string'
    )
  }
}

const logCalling = (uid, callType) => {
  db.collection(`api/log/${callType}/user/${uid}`).add({
    time: admin.firestore.FieldValue.serverTimestamp(),
  })
}

const isValidCall = async (uid, callType) => {
  const settings = await db.doc(`api/settings/type/${callType}/`).get()
  const limitation = settings.data()
  const t = new Date(Date.now() - limitation.limitMinutes * 60 * 1000)
  const snapshot = await db
    .collection(`api/log/${callType}/user/${uid}`)
    .orderBy('time')
    .startAt(admin.firestore.Timestamp.fromDate(t))
    .get()
    .catch(err => {
      console.error(err)
    })
  const isValid = snapshot.size <= limitation.count
  console.log({ isValidCall: isValid, limitation, callCount: snapshot.size })
  return isValid
}

const convertFromFirestore = arg => {
  if (arg instanceof admin.firestore.DocumentReference) {
    return {
      __isFirebaseObject: true,
      type: 'DocumentReference',
      path: arg.path,
    }
  } else if (arg instanceof admin.firestore.CollectionReference) {
    return {
      __isFirebaseObject: true,
      type: 'CollectionReference',
      path: arg.path,
    }
  } else if (arg instanceof admin.firestore.Timestamp) {
    return {
      __isFirebaseObject: true,
      type: 'Timestamp',
      time: arg.toDate().getTime(),
    }
  } else if (arg instanceof String) {
    return arg
  }
  if (arg instanceof Array) {
    const result = []
    arg.forEach(elm => {
      result.push(convertFromFirestore(elm))
    })
    return result
  } else if (arg instanceof Object) {
    const result = {}
    Object.keys(arg).forEach(elm => {
      result[elm] = convertFromFirestore(arg[elm])
    })
    return result
  } else {
    return arg
  }
}

module.exports = { checkAuth, checkArgments, logCalling, isValidCall, convertFromFirestore }
