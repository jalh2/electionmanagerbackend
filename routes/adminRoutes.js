const express = require('express')
const { loginAdmin, signupAdmin } = require('../controllers/adminController')

const router = express.Router()

// login route
router.post('/login', loginAdmin)

// signup route
router.post('/signup', signupAdmin)

module.exports = router
