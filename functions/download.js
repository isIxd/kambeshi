const { functions, admin, db, bucket } = require('./firebase.js')
const { checkAuth, checkArgments, logCalling, isValidCall } = require('./apiUtil.js')

const getDownloadUrls = async publicRefs => {
  const result = await Promise.all(publicRefs.map(publicPath => getDownloadUrl(publicPath)))
  return [].concat(...result) // array.flat() の代替
}

const getDownloadUrl = publicRef => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const publicData = await publicRef.get()
    const singleId = publicRef.id
    const privateDoc = await publicRef.parent.parent
      .collection('private')
      .doc(singleId)
      .get()
    const file = bucket.file(privateDoc.data().data)
    const existsData = await file.exists()
    if (!existsData[0]) reject('The file does not exist.')
    const config = {
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24, //now + 1day
    }
    const data = await Promise.all([file.getSignedUrl(config), file.getMetadata()])
    const temp = privateDoc.data().data.split('.')
    const extension = temp[temp.length - 1]
    const singleData = publicData.data()
    resolve([
      {
        url: data[0][0],
        name: `${singleData.name}.${extension}`,
        size: data[1][0].size,
        extension,
        artwork: singleData.artwork,
      },
    ])
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
    let files = ''
    switch (snData.type) {
      case 'single':
        files = await getDownloadUrl(snData.contents)
        break
      case 'package':
        // eslint-disable-next-line no-case-declarations
        const packageDoc = await snData.contents.get()
        files = await getDownloadUrls(packageDoc.data().contents)
        break
    }

    const result = { files, type: snData.type }

    // ダウンロード残り回数を減らす
    try {
      await snRef.update({
        downloadsRemaining: snData.downloadsRemaining - 1,
        downloadsCount: snData.downloadsCount + 1,
        updatedDate: admin.firestore.FieldValue.serverTimestamp(),
      })
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = functions.region('asia-northeast1').https.onCall(async (data, context) => {
  checkAuth(context)
  checkArgments(data)

  logCalling(context.auth.uid, 'download')

  const isValidCallResult = await isValidCall(context.auth.uid, 'validate')
  if (!isValidCallResult) {
    throw new functions.https.HttpsError('resource-exhausted', 'Please wait a while and try again')
  }

  const snRef = db.collection('serialnumber').doc(data.serialnumber)

  const result = await downloadProcess(snRef).catch(error => {
    console.log('Transaction failure:', error)
    throw new functions.https.HttpsError('internal-error', error)
  })
  return result
})
