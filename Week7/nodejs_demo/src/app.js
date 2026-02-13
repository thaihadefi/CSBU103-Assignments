const express = require('express')
const path = require('path')
const crypto = require('crypto')
var cookieParser = require("cookie-parser")
var session = require("express-session")
const Joi = require('joi')
const bcrypt = require('bcrypt')
const app = express()
const UserController = require('./controllers/user') 
const { UserModel } = require('./models')
var debug = require("debug")("index.js");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeEmail = (value) => (value || '').trim().toLowerCase()

const getOrCreateCsrfToken = (req) => {
  if (!req.session) return ''
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex')
  }
  return req.session.csrfToken
}

const validateCsrf = (req, res, next) => {
  const sessionToken = req.session && req.session.csrfToken
  const requestToken = req.get('x-csrf-token') || (req.body && req.body._csrf) || (req.query && req.query._csrf)
  if (!sessionToken || !requestToken || sessionToken !== requestToken) {
    return res.status(403).send({ status: false, msg: 'Invalid CSRF token' })
  }
  next()
}

app.use(express.json())
app.use(express.urlencoded(({ extended: false })))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(
  session({
    secret: process.env.SESSION_SECRET || "demoapp-dev-only",
    name: "app",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  })
);
const checkLoggedIn = function(req, res, next) {
  if (req.session.loggedIn) {
    debug(
      "checkLoggedIn(), req.session.loggedIn:",
      req.session.loggedIn,
      "executing next()"
    );
    next();
  } else {
    debug(
      "checkLoggedIn(), req.session.loggedIn:",
      req.session.loggedIn,
      "rendering login"
    );
    if (req.originalUrl.startsWith('/users')) {
      return res.status(401).send({ status: false, msg: 'Authentication required' })
    }
    res.redirect('/login');
  }
}

app.use('/users', checkLoggedIn, function(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return validateCsrf(req, res, next)
  }
  next()
}, UserController)


app.get('/', checkLoggedIn, async function (req, res) {
  const allUsers = await UserModel.getAllUsers()
  const csrfToken = getOrCreateCsrfToken(req)
  // pass through any create errors/success messages from query string
  const createError = req.query && req.query.createError ? req.query.createError : undefined
  const createSuccess = req.query && req.query.createSuccess ? req.query.createSuccess : undefined
  res.render('index', { data: allUsers || [], createError, createSuccess, csrfToken })

})

app.post('/login', async function(req, res) {
  const normalizedUsername = normalizeEmail(req.body && req.body.username)
  const password = (req.body && req.body.password) || ''

  if (!normalizedUsername) {
    return res.render('login', { error: 'Email is required' })
  }

  if (!emailRegex.test(normalizedUsername)) {
    return res.render('login', { error: 'Please enter a valid email address' })
  }

  if (!password || password.trim().length === 0) {
    return res.render('login', { error: 'Password is required' })
  }

  try {
    const user = await UserModel.findUserByUsername(normalizedUsername)
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.render('login', { error: 'Invalid email or password' })
    }

    req.session.loggedIn = true
    return res.redirect('/')
  } catch (error) {
    console.error('Unexpected login error:', error)
    return res.render('login', { error: 'Unable to login right now. Please try again.' })
  }
})

app.get('/login', function(req, res) {
  if(req.session.loggedIn) res.redirect('/')
  const success = req.query && req.query.registered ? 'Registration successful! Please login.' : undefined
  res.render('login', { success })
})

// Logout route: destroy session and redirect to login
app.get('/logout', function(req, res) {
  // destroy session and redirect to login page
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        console.error('Error destroying session during logout', err)
      }
      // clear cookie if present
      res.clearCookie('app')
      return res.redirect('/login')
    })
  } else {
    return res.redirect('/login')
  }
})

// Registration validation schema with Joi
const registrationSchema = Joi.object({
  username: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Username must be a valid email address',
      'string.empty': 'Username is required',
      'any.required': 'Username is required'
    }),
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.pattern.base': 'Password must contain at least 1 number and 1 special character (!@#$%^&*)',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm password is required',
      'any.required': 'Confirm password is required'
    })
})

app.get('/register', function(req, res) {
  if(req.session.loggedIn) res.redirect('/')
  res.render('register')
})

app.post('/register', async function(req, res) {
  const normalizedUsername = normalizeEmail(req.body && req.body.username)
  const password = (req.body && req.body.password) || ''
  const confirmPassword = (req.body && req.body.confirmPassword) || ''
  const name = (req.body && req.body.name) || ''
  
  // Validate input with Joi
  const { error } = registrationSchema.validate({ username: normalizedUsername, password, confirmPassword })
  if (error) {
    return res.render('register', { error: error.details[0].message })
  }

  try {
    const existingUser = await UserModel.findUserByUsername(normalizedUsername)
    if (existingUser) {
      return res.render('register', { error: 'User with this email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const displayName = (name && name.trim().length > 0) ? name.trim() : normalizedUsername.split('@')[0]
    const newUser = {
      username: normalizedUsername,
      password: hashed,
      name: displayName
    }

    await UserModel.insertUser(newUser)
    return res.redirect('/login?registered=1')
  } catch (err) {
    if (err && err.code === 11000) {
      return res.render('register', { error: 'User with this email already exists' })
    }
    console.error('Unexpected register error:', err)
    return res.render('register', { error: 'Unable to register right now. Please try again.' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`)
})
