const {Router} = require('express');
const { registerUsers, } = require('../controllers/authControllers');
// const { verifyToken } = require('../middleware/verifyToken');
const usersRouter = Router()

usersRouter.post('/register', registerUsers)
// usersRouter.post('/login',userLogin)

module.exports = {
    usersRouter
}