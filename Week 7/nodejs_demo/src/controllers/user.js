const express = require('express')
const { UserModel } = require('../models')
const { uuid } = require('uuidv4')
const bcrypt = require('bcrypt')
const Joi = require('joi')

// var bodyParser = require('body-parser')
// const jsonParser = bodyParser.json()

const router = express.Router()

router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now().toString())
    next()
})
// PATH: URL/users/
router.get('/', async function(req, res) {
    const rs = await UserModel.getAllUsers()
    console.log(rs)
    res.send(rs)
})
// users/:username
router.get('/:username', async function(req, res) {
    const username = req.params.username
    try {
        const rs = await UserModel.findUserByUsername(username)
        if (!rs) return res.status(404).send({ status: false, msg: 'User not found' })
        return res.send({ status: true, data: rs })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ status: false, msg: 'Error fetching user', error: err.message })
    }
})
router.post('/', async function(req, res) {
    // Server-side validation using Joi (same rules as registration)
    const schema = Joi.object({
        username: Joi.string().email().required().messages({ 'string.email': 'Email must be a valid email address', 'any.required': 'Email is required' }),
        password: Joi.string().min(6).pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/).required().messages({ 'string.min': 'Password must be at least 6 characters', 'string.pattern.base': 'Password must contain at least 1 number and 1 special character (!@#$%^&*)', 'any.required': 'Password is required' }),
        name: Joi.string().allow('').optional(),
        gender: Joi.string().allow('').optional()
    })

    const { error } = schema.validate(req.body)
    if (error) return res.status(400).send({ status: false, msg: error.details[0].message })

    try {
        const { username, name, gender } = req.body
        const { password } = req.body
        const hashed = await bcrypt.hash(password, 10)

        const newUser = {
            id: uuid(),
            username: (username || '').trim(),
            name: name,
            gender: gender,
            password: hashed
        }

        const result = await UserModel.insertUser(newUser)
        const responseData = { id: newUser.id, username: newUser.username, name: newUser.name, gender: newUser.gender }
        return res.status(201).send({ status: true, data: responseData, insertedId: result && result.insertedId })
    } catch (error) {
        console.log(error)
        // handle duplicate email (unique index) specifically
        if (error && error.code === 11000) {
            return res.status(409).send({ status: false, msg: 'Email already exists' })
        }
        return res.status(500).send({ status: false, msg: 'Unable to insert new user', error })
    }

})

router.post('/create', async function(req, res) {
    // Validate form input as above; for form-based create redirect back on validation error
    const schema = Joi.object({
        username: Joi.string().email().required(),
        password: Joi.string().min(6).pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/).required(),
        name: Joi.string().allow('').optional(),
        gender: Joi.string().allow('').optional()
    })
    const { error } = schema.validate(req.body)
    if (error) {
        // redirect with error message (simple UX)
        return res.redirect('/?createError=' + encodeURIComponent(error.details[0].message))
    }

    try {
        const { username, name, gender, password } = req.body
        const hashed = await bcrypt.hash(password, 10)
        const newUser = { id: uuid(), username: (username || '').trim(), name: name, gender: gender, password: hashed }
        await UserModel.insertUser(newUser)
        return res.redirect('/')
    } catch (err) {
        console.error(err)
        // if duplicate key error, redirect back with a friendly message
        if (err && err.code === 11000) {
            return res.redirect('/?createError=' + encodeURIComponent('Email already exists'))
        }
        return res.status(500).send('Unable to create user')
    }

})
router.delete('/:userId', async function(req, res) {
    const { userId } = req.params 
    try {
        const ok = await UserModel.delUser(userId)
        if (!ok) return res.status(404).send({ status: false, msg: 'User not found' })
        return res.send({ status: true })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ status: false, msg: 'Unable to delete user' })
    }
})

router.put('/:userId', async function (req, res) {
    const { userId } = req.params
    try {
        if(!userId) return res.status(404).send({ status: false, msg: 'Missing user id' })
        const { username, name, gender } = req.body
        console.log('Update payload:', req.body)

        // fetch existing user to detect changes
        const existing = await UserModel.findUserById(userId)
        if (!existing) return res.status(404).send({ status: false, msg: 'User not found' })

    // normalize values for comparison
    // If username is not provided in the payload, treat it as unchanged
    const existingUsername = (existing.username || '').trim()
    const newUsername = (typeof username === 'undefined') ? existingUsername : (username || '').trim()
    const newName = (typeof name === 'undefined') ? (existing.name || '') : name
    const newGender = (typeof gender === 'undefined') ? (existing.gender || '') : gender

    const existingName = existing.name || ''
    const existingGender = existing.gender || ''


        // If username/email differs, disallow changing it via this endpoint to avoid login confusion
        if (newUsername !== existingUsername) {
            return res.status(400).send({ status: false, msg: 'Changing email is not allowed via this endpoint. Use the change-email endpoint which requires password confirmation.' })
        }

        // determine if anything else actually changed
        const changed = (newName !== existingName) || (newGender !== existingGender)

        if (!changed) {
            // nothing to do — respond clearly so UI can decide how to notify the user
            return res.send({ status: true, updated: false, msg: 'No changes detected' })
        }

        // prepare minimal update object with only changed fields (username is intentionally excluded)
        const updateObj = {}
        if (newName !== existingName) updateObj.name = newName
        if (newGender !== existingGender) updateObj.gender = newGender

        const ok = await UserModel.updateUser(updateObj, userId)
        if (!ok) return res.status(404).send({ status: false, msg: 'User not found or not updated' })
        res.send({ status: true, updated: true, data: { id: userId, ...updateObj }, msg: 'Updated successfully' })
    }
    catch(err) {
        console.log(err)
        res.send({
            status: false, 
            msg: 'Unable to update user',
            error: err
        })
    }
})

// change-email endpoint removed per request
module.exports = router

