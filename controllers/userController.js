const User = require('../models/userModel')

// login user
const loginUser = async (req, res) => {
  const {email, password} = req.body

  try {
    const user = await User.login(email, password)
    res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    })
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// create user
const createUser = async (req, res) => {
  const {email, password, name, role} = req.body

  try {
    const user = await User.signup(email, password, name, role)
    res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    })
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -salt')
    res.status(200).json(users)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

module.exports = { loginUser, createUser, getUsers }
