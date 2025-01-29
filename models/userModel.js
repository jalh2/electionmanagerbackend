const mongoose = require('mongoose')
const crypto = require('crypto')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
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
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['data_entry', 'viewer']
  }
}, { timestamps: true })

// Hash password using crypto
const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
}

// static signup method
userSchema.statics.signup = async function(email, password, name, role) {
  // validation
  if (!email || !password || !name || !role) {
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

  const user = await this.create({ 
    email, 
    password: hashedPassword,
    salt,
    name, 
    role 
  })

  return user
}

// static login method
userSchema.statics.login = async function(email, password) {
  if (!email || !password) {
    throw Error('All fields must be filled')
  }

  const user = await this.findOne({ email })
  if (!user) {
    throw Error('Incorrect email')
  }

  const hashedPassword = hashPassword(password, user.salt)
  if (hashedPassword !== user.password) {
    throw Error('Incorrect password')
  }

  return user
}

module.exports = mongoose.model('User', userSchema)
