const express = require('express')
const {
  createElectionResult,
  getElectionResults,
  getDistrictResults
} = require('../controllers/electionController')

const router = express.Router()

// get all results
router.get('/', getElectionResults)

// get results by district
router.get('/district/:district', getDistrictResults)

// create new result
router.post('/', createElectionResult)

module.exports = router
