const router = require('express').Router();

const { register, login, logout, refreshAccessToken } = require('../controllers/auth')
const { isAuth } = require('../middlewares/isAuth')

router.post('/register', register);
router.post('/login', login)
router.post('/logout', isAuth, logout)
router.post('/refresh_token', isAuth, refreshAccessToken)
router.post('/isAuth', isAuth, (req, res) => {
    res.send(true);
})

module.exports = router