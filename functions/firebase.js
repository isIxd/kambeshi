const admin = require('firebase-admin')
const functions = require('firebase-functions')
const { Storage } = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(functions.config().bucket.name)
admin.initializeApp()
const db = admin.firestore()

module.exports = { admin, functions, storage, bucket, db }
