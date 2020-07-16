const admin = require('firebase-admin')
const functions = require('firebase-functions')
const { Storage } = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(functions.config().bucket.name)
admin.initializeApp()
const db = admin.firestore()

const getDownloadUrls = paths => {
  return Promise.all(paths.map(path => getDownloadUrl(path)))
}

const getDownloadUrl = path => {
  return new Promise(async (resolve, reject) => {
    const file = bucket.file(path)
    const data = await file.exists()
    if (!data[0]) reject('The file does not exist.')
    const config = {
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24, //now + 1day
    }
    resolve(file.getSignedUrl(config))
  })
}

const downloadProcess = async snRef => {
  const snDoc = await snRef.get()
  if (!snDoc.exists) {
    return Promise.reject('Invalid serial number!')
  }
  const snData = snDoc.data()
  // ダウンロード残り回数のチェック
  if (snData.downloadsRemaining <= 0) {
    return Promise.reject('You cannot download any more!')
  } else {
    // ダウンロードURL発行処理
    let downloadUrl = ''
    if (snData.type === 'single') {
      const singleId = snData.contents.id
      const doc = await snData.contents.parent.parent
        .collection('private')
        .doc(singleId)
        .get()

      downloadUrl = await getDownloadUrl(doc.data().data)
    } else if (snData.type === 'package') {
      snData.contents.get().then(doc => {
        console.log(doc.data())
      })
      // @TODO: make urls to every single
    }

    // ダウンロード残り回数を減らす
    try {
      await snRef.update({
        downloadsRemaining: snData.downloadsRemaining - 1,
        downloadsCount: snData.downloadsCount + 1,
        updatedDate: admin.firestore.FieldValue.serverTimestamp(),
      })
      return Promise.resolve(downloadUrl)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

exports.download = functions.https.onRequest((req, res) => {
  if (req.method !== 'GET') {
    console.warn('Not Allowed: ' + req.method)
    res.status(405).send('Method Not Allowed')
    return
  }
  if (!req.query.serialnumber) {
    res.status(400).send('Request Parameter')
    return
  }

  const snRef = db.collection('serialnumber').doc(req.query.serialnumber)

  downloadProcess(snRef)
    .then(result => {
      console.log('Transaction success', result)
      return res.status(200).json({ result })
    })
    .catch(err => {
      console.log('Transaction failure:', err)
      return res.status(400).json({ err })
    })
})
