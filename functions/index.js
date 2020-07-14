const functions = require('firebase-functions')
const { Storage } = require('@google-cloud/storage')
const storage = new Storage()

exports.download = functions.https.onRequest((req, res) => {
  if (req.method !== 'GET') {
    console.warn('Not Allowed: ' + req.method)
    res.status(405).send('Method Not Allowed')
    return
  }
  if (!req.query.file) {
    res.status(400).send('Request Parameter')
    return
  }

  const bucket = storage.bucket(functions.config().bucket.name)
  const file = bucket.file(req.query.file)
  file
    .exists()
    .then(data => {
      console.log(data)
      return new Promise((resolve, reject) => {
        if (!data[0]) {
          reject(new Error(`file not found: ${req.query.file}`))
        } else {
          const config = {
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 24, //now + 1day
          }
          resolve(file.getSignedUrl(config))
        }
      })
    })
    .then(results => {
      return res.status(200).json({ url: results[0] })
    })
    .catch(err => {
      console.error(err)
      return res.status(400).json({ message: 'An error has occurred' })
    })
})
