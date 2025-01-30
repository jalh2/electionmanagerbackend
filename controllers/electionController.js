const ElectionResult = require('../models/electionResultModel')
const mongoose = require('mongoose')
const Tesseract = require('tesseract.js')

// get all election results
const getElectionResults = async (req, res) => {
  try {
    const results = await ElectionResult.find({}).sort({createdAt: -1})
    res.status(200).json(results)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// get results by district
const getDistrictResults = async (req, res) => {
  const { district } = req.params

  try {
    const results = await ElectionResult.find({ electoralDistrict: district })
      .sort({createdAt: -1})
    res.status(200).json(results)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// create new result
const createElectionResult = async (req, res) => {
  const { precinctCode, electoralDistrict, pollingPlaceNumber, results } = req.body

  try {
    const electionResult = await ElectionResult.create({
      precinctCode,
      electoralDistrict,
      pollingPlaceNumber,
      results
    })

    res.status(200).json(electionResult)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// scan and process election result from image
const scanElectionResult = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  try {
    const imageBuffer = req.file.buffer
    
    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100)
            res.write(`data: ${JSON.stringify({ progress })}\n\n`)
          }
        }
      }
    )

    // Process the extracted text
    const processedResults = processExtractedText(text)

    // Send the final results
    res.write(`data: ${JSON.stringify({ progress: 100, results: processedResults })}\n\n`)
    res.end()
  } catch (error) {
    console.error('Scan error:', error)
    res.write(`data: ${JSON.stringify({ error: 'Failed to process image' })}\n\n`)
    res.end()
  }
}

// Helper function to process extracted text
const processExtractedText = (text) => {
  const lines = text.split('\n');
  let precinctCode = '';
  let electoralDistrict = '';
  let pollingPlaceNumber = '';
  const partyResults = [];

  // Define party codes
  const PARTY_CODES = {
    'GDM': 'GDM',
    'UP': 'UP',
    'LRP': 'LRP',
    'CPP': 'CPP',
    'MPC': 'MPC'
  };

  // First pass: find the header information
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toUpperCase();
    
    if (line.includes('VOTING PRECINCT CODE')) {
      // Look at the next few lines for a value
      for (let j = 1; j <= 3; j++) {
        const nextLine = lines[i + j]?.trim();
        if (nextLine && !nextLine.includes('ELECTORAL') && !nextLine.includes('POLLING')) {
          precinctCode = nextLine;
          break;
        }
      }
    }
    
    if (line.includes('ELECTORAL DISTRICT NUMBER')) {
      // Look at the next few lines for a number
      for (let j = 1; j <= 3; j++) {
        const nextLine = lines[i + j]?.trim();
        if (nextLine && !isNaN(parseInt(nextLine))) {
          electoralDistrict = parseInt(nextLine);
          break;
        }
      }
    }
    
    if (line.includes('POLLING PLACE NUMBER')) {
      // Look at the next few lines for a value
      for (let j = 1; j <= 3; j++) {
        const nextLine = lines[i + j]?.trim();
        if (nextLine && !nextLine.includes('VOTES') && !nextLine.includes('PARTY')) {
          pollingPlaceNumber = nextLine;
          break;
        }
      }
    }
  }

  // Find the "VOTES OBTAINED" column
  let votesColumnIndex = -1;
  let partyColumnIndex = -1;
  
  // Find column positions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toUpperCase();
    if (line.includes('VOTES OBTAINED')) {
      votesColumnIndex = line.indexOf('VOTES OBTAINED');
      // Look for party names in previous lines
      for (let j = i - 1; j >= 0; j--) {
        const prevLine = lines[j].trim().toUpperCase();
        for (const party of Object.keys(PARTY_CODES)) {
          if (prevLine.includes(`(${party})`)) {
            partyColumnIndex = prevLine.indexOf(`(${party})`);
            break;
          }
        }
        if (partyColumnIndex !== -1) break;
      }
      break;
    }
  }

  // Second pass: find party results using column positions
  if (votesColumnIndex !== -1) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toUpperCase();
      
      // Look for party codes in parentheses
      for (const [partyCode, mappedCode] of Object.entries(PARTY_CODES)) {
        if (line.includes(`(${partyCode})`)) {
          // Look for votes in nearby lines
          for (let j = -2; j <= 2; j++) {
            const voteLine = lines[i + j];
            if (voteLine && votesColumnIndex < voteLine.length) {
              // Extract the portion of the line near the votes column
              const voteSection = voteLine.substring(votesColumnIndex - 5, votesColumnIndex + 15).trim();
              // Look for numbers in this section
              const voteMatch = voteSection.match(/\d+/);
              if (voteMatch) {
                partyResults.push({
                  party: mappedCode,
                  votes: parseInt(voteMatch[0], 10)
                });
                break;
              }
            }
          }
          break;
        }
      }
    }
  }

  return {
    precinctCode,
    electoralDistrict,
    pollingPlaceNumber,
    results: partyResults
  };
};

module.exports = {
  getElectionResults,
  getDistrictResults,
  createElectionResult,
  scanElectionResult
}
