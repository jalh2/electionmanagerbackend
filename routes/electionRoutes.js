const express = require('express')
const {
  createElectionResult,
  getElectionResults,
  getDistrictResults,
  scanElectionResult
} = require('../controllers/electionController')
const multer = require('multer')

const router = express.Router()

// Configure multer for handling file uploads
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
      cb(null, true)
    } else {
      cb(new Error('Only JPG files are allowed'))
    }
  }
})

// get all results
router.get('/', getElectionResults)

// get results by district
router.get('/district/:district', getDistrictResults)

// create new result
router.post('/', createElectionResult)

// scan result from image
router.post('/scan', upload.single('file'), scanElectionResult)

module.exports = router
