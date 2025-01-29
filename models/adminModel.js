const mongoose = require('mongoose')
const crypto = require('crypto')
const validator = require('validator')

const Schema = mongoose.Schema

const adminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
}, { timestamps: true })

// Hash password using crypto
const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
}

// static signup method
adminSchema.statics.signup = async function(email, password) {
  // validation
  if (!email || !password) {
    throw Error('All fields must be filled')
  }
  if (!validator.isEmail(email)) {
    throw Error('Email is not valid')
  }
  
  const exists = await this.findOne({ email })
  if (exists) {
    throw Error('Email already in use')
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const hashedPassword = hashPassword(password, salt)

  const admin = await this.create({ 
    email, 
    password: hashedPassword,
    salt 
  })

  return admin
}

// static login method
adminSchema.statics.login = async function(email, password) {
  if (!email || !password) {
    throw Error('All fields must be filled')
  }

  const admin = await this.findOne({ email })
  if (!admin) {
    throw Error('Incorrect email')
  }

  const hashedPassword = hashPassword(password, admin.salt)
  if (hashedPassword !== admin.password) {
    throw Error('Incorrect password')
  }

  return admin
}

module.exports = mongoose.model('Admin', adminSchema)
