const { functions, db } = require('./firebase.js')
const {
  checkAuth,
  checkArgments,
  logCalling,
  isValidCall,
  convertFromFirestore,
} = require('./apiUtil.js')

module.exports = functions.region('asia-northeast1').https.onCall(async (data, context) => {
  checkAuth(context)
  checkArgments(data)

  logCalling(context.auth.uid, 'validate')

  const result = await Promise.all([
    isValidCall(context.auth.uid, 'validate'),
    db.doc(`serialnumber/${data.serialnumber}`).get(),
  ])

  if (!result[0]) {
    // isValidCall == false
    throw new functions.https.HttpsError('resource-exhausted', 'Please wait a while and try again')
  }

  const snapshotData = result[1].data() // doc.get()
  if (snapshotData) {
    return { isValid: true, data: convertFromFirestore(snapshotData) }
  } else {
    return { isValid: false }
  }
})
