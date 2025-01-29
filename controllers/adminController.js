const Admin = require('../models/adminModel')

// login admin
const loginAdmin = async (req, res) => {
  const {email, password} = req.body

  try {
    const admin = await Admin.login(email, password)
    res.status(200).json({
      email: admin.email,
      id: admin._id
    })
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// signup admin
const signupAdmin = async (req, res) => {
  const {email, password} = req.body

  try {
    const admin = await Admin.signup(email, password)
    res.status(200).json({
      email: admin.email,
      id: admin._id
    })
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

module.exports = { signupAdmin, loginAdmin }
