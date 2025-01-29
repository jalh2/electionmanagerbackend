const express = require('express')
const { loginUser, createUser, getUsers } = require('../controllers/userController')

const router = express.Router()

// login route
router.post('/login', loginUser)

// create new user
router.post('/create', createUser)

// get all users
router.get('/', getUsers)

module.exports = router
