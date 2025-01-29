const ElectionResult = require('../models/electionResultModel')

// create a new election result
const createElectionResult = async (req, res) => {
  const { precinctCode, electoralDistrict, pollingPlaceNumber, results, submittedBy } = req.body

  try {
    const electionResult = await ElectionResult.create({
      precinctCode,
      electoralDistrict,
      pollingPlaceNumber,
      results,
      submittedBy
    })

    res.status(200).json(electionResult)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// get all election results
const getElectionResults = async (req, res) => {
  try {
    const results = await ElectionResult.find({})
      .populate('submittedBy', 'name email')
      .sort({createdAt: -1})
    
    res.status(200).json(results)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// get election results by district
const getDistrictResults = async (req, res) => {
  const { district } = req.params

  try {
    const results = await ElectionResult.find({ electoralDistrict: district })
      .populate('submittedBy', 'name email')
      .sort({createdAt: -1})
    
    res.status(200).json(results)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

module.exports = {
  createElectionResult,
  getElectionResults,
  getDistrictResults
}
