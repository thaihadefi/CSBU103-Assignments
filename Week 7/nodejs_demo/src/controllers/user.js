const express = require('express')
const { UserModel } = require('../models')
const { uuid } = require('uuidv4')

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
    // const { username } = req.params
    const usernane = req.params.username 
    const rs = await UserModel.findUserByUsername(username)
    console.log(rs)
    res.send(rs)
})
router.post('/', async function(req, res) {
    const { username, name, gender } = req.body 
    const newUser = {
        id: uuid(),
        username: username,
        name: name,
        gender: gender
    }
    try {
        await UserModel.insertUser(newUser)
        res.send({ status: true , data: newUser})
    }
    catch(error) {
        console.log(error)
        res.send({
            status: false,
            msg: 'Unable to insert new user',
            error
        })
    }
    
})

router.post('/create', async function(req, res) {
    const { username, name, gender } = req.body 
    console.log(req.body)
    const newUser = {
        id: uuid(),
        username: username,
        name: name,
        gender: gender
    }
    try {
        await UserModel.insertUser({newUser})
        res.redirect('/')
    }
    catch(error) {
        console.log(error)
       
    }
    
})
router.delete('/:userId', async function(req, res) {
    const { userId } = req.params 
    await UserModel.delUser(userId)
    res.send({ status: true })
})

router.put('/:userId', async function (req, res) {
    const { userId } = req.params
    try {
        if(!userId) res.status(404)
        const { username, name, gender } = req.body
        console.log(req.body)
        await UserModel.updateUser({
            username, name, gender
        }, userId)
        res.send({
            status: true,
            data: {
                username, name, gender
            }
        })
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
module.exports = router

