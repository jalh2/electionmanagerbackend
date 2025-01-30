const mongoose = require('mongoose')

const Schema = mongoose.Schema

const electionResultSchema = new Schema({
  precinctCode: {
    type: String,
    required: true
  },
  electoralDistrict: {
    type: Number,
    required: true
  },
  pollingPlaceNumber: {
    type: String,
    required: true
  },
  results: [{
    party: {
      type: String,
      required: true
    },
    candidateName: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { timestamps: true })

// Create a compound index for unique polling places
electionResultSchema.index({ 
  precinctCode: 1, 
  electoralDistrict: 1, 
  pollingPlaceNumber: 1 
}, { unique: true })

module.exports = mongoose.model('ElectionResult', electionResultSchema)
