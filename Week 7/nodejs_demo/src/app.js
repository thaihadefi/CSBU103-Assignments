const express = require('express')
const path = require('path')
var cookieParser = require("cookie-parser")
var session = require("express-session")
const Joi = require('joi')
const bcrypt = require('bcrypt')
const app = express()
const UserController = require('./controllers/user') 
const { UserModel } = require('./models')
var debug = require("debug")("index.js");

app.use(express.json())
app.use(express.urlencoded(({ extended: false })))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/users', UserController)
app.use(cookieParser())
app.use(
  session({
    secret: "demoapp",
    name: "app",
    resave: true,
    saveUninitialized: true,
    // cookie: { maxAge: 10000 } /* 6000 ms? 6 seconds -> wut? :S */
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
    res.redirect("login");
  }
}


app.get('/', checkLoggedIn, async function (req, res) {
  // res.sendFile(path.join(__dirname,'index.html'))
  const allUsers = await UserModel.getAllUsers() 
  console.log(allUsers)
  res.render('index', { data: allUsers || [] })

})

app.post('/login', async function(req, res) {
  const { username, password } = req.body     
    try {
        // Validate input fields
        if (!username || username.trim().length === 0) {
          throw new Error('Email is required')
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(username)) {
          throw new Error('Please enter a valid email address')
        }
        
        if (!password || password.trim().length === 0) {
          throw new Error('Password is required')
        }
        
        const user = await UserModel.findUserByUsername(username)
        // FAIL-FAST 
        console.log({ user });
        // Verify user exists and password matches (bcrypt)
        if(!user) throw new Error('No account found with this email')
        const match = await bcrypt.compare(password, user.password)
        if(!match) throw new Error('Incorrect password')
        req.session.loggedIn = true
        res.redirect('/')
    }
    catch(error) {
      console.error(error)
      res.render('login', { error: error.message })
    }
})

app.get('/login', function(req, res) {
  if(req.session.loggedIn) res.redirect('/')
  const success = req.query && req.query.registered ? 'Registration successful! Please login.' : undefined
  res.render('login', { success })
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
  const { username, password, confirmPassword, name } = req.body
  
  try {
    // Validate input with Joi
    const { error } = registrationSchema.validate({ username, password, confirmPassword })
    
    if (error) {
      throw new Error(error.details[0].message)
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findUserByUsername(username)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }
    
    // Create new user — hash password before storing
    const hashed = await bcrypt.hash(password, 10)
    const displayName = (name && name.trim().length > 0) ? name.trim() : username.split('@')[0]
    const newUser = {
      username: username,
      password: hashed,
      name: displayName
    }
    
    const result = await UserModel.insertUser(newUser)
    console.log('Inserted user id:', result && result.insertedId)
    // Redirect to login with a success flag so UI can show a friendly message
    res.redirect('/login?registered=1')
  } catch(error) {
    console.error(error)
    // Handle duplicate key error from MongoDB
    if (error && error.code === 11000) {
      return res.render('register', { error: 'User with this email already exists' })
    }
    res.render('register', { error: error.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`)
})