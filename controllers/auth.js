//require modules
const bcrypt = require('bcrypt')

//require Models
const { User } = require('../models')

//require helper functions
const { updateRefreshToken, revokeRefreshToken, decodeAccessToken, createAccessToken, createRefreshToken, verifyRefreshToken } = require('../helpers/authHelper');

module.exports = {

    register: async (req, res) => {
        //check if req has values
        if (req.body.email && req.body.password) {
            //retrieve the values from request
            const { email, password } = req.body;
            //check if user already exists
            const user = await User.findAll({
                where: {
                    email
                }
            });
            if (user.length > 0) {//user already exists
                res.send({
                    status: 0,
                    message: "User Already Exists.",
                    content: {}
                })
            } else { //user does not exists? then create one
                const newUser = await User.create({
                    email: email,
                    password: bcrypt.hashSync(password, 10)
                })
                //send a success response
                res.send({
                    status: 1,
                    message: "User registered successfully.",
                    content: newUser
                })
            }
        } else {// if request does not have required values, then send error response
            res.send({
                status: 0,
                message: "Required field missing.",
                content: {}
            })
        }
    },
    login: async (req, res) => {

        //check if the request's body has the required values
        if (req.body.email && req.body.password) {
            //retrieve data from request
            const { email, password } = req.body;
            //check if account exists
            var user = await User.findAll({
                where: {
                    email
                }
            });
            if (user.length > 0) {//if account exists, preoceed forward.
                //do password validation
                user = user[0];
                if (bcrypt.compareSync(password, user.password)) {//if password matched, login the user

                    //create a access token
                    const accessToken = createAccessToken({
                        id: user.id,
                        email: user.email
                    });

                    //create a refresh token
                    const refreshToken = createRefreshToken({
                        id: user.id,
                        email: user.email
                    });

                    //update the refreshtoken to the user on database
                    updateRefreshToken(user.id, refreshToken);

                    //send a refresh token as a httponly cookie to the client
                    res.cookie('accessToken', accessToken, {
                        httpOnly: true,
                        path: '/'
                    });

                    //send a refresh token as a httponly cookie to the client
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        path: '/refresh_token'
                    });
                    //sned a login success response along with access token and refresh token
                    res.send({
                        status: 1,
                        message: "Login Successful",
                        content: {
                            accessToken,
                            refreshToken
                        }
                    })
                } else {//if password do not matched
                    //send a invlaid credentials error respose 
                    res.send({
                        status: 0,
                        message: "Invalid Credentials",
                        content: {}
                    })
                }
            } else {//if account not exixts, then show error.
                //send a no valid account error response
                res.send({
                    status: 0,
                    message: "No valid account with that email.",
                    content: {}
                })
            }
        } else { //if the request's body don't have the required values
            //send a required field missing error response.
            res.send({
                status: 0,
                message: "Required field missing.",
                content: {}
            })
        }
    },
    logout: (req, res) => {
        //check if the request has authorization header
        if (req.headers['authorization']) { //if authorization header is present, proceed forward
            const token = req.headers['authorization'].split(" ")[1];
            const user = decodeAccessToken(token);
            // res.send(user);
            res.clearCookie('refreshtoken');
            revokeRefreshToken(user.id);
            res.send({
                status: 1,
                message: "Logged out successfully.",
                content: {}
            });
        }
        else { //if authoriazation header is not present, 
            //send not authorized error response
            res.send({
                status: 0,
                message: "Not authorized.",
                content: {}
            })
        }
    },
    refreshAccessToken: async (req, res) => {
        const verify = await verifyRefreshToken(req.cookies.refreshToken);
        if (verify.status = 1) {
            const accessToken = createAccessToken({
                id: verify.content.id,
                email: verify.content.email
            });

            const refreshToken = createRefreshToken({
                id: verify.content.id,
                email: verify.content.email
            });

            updateRefreshToken(verify.content.id, refreshToken);
            // console.log(accessToken);
            // console.log(refreshToken);
            // const refreshtoken = 
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                path: '/'
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/refresh_token'
            });
            res.send({
                status: 1,
                message: "Token Refresh Successful",
                content: {
                    accessToken,
                    refreshToken
                }
            })
        }
        else {
            res.send(verify);
        }
    }
}