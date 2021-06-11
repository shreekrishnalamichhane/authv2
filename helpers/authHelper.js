//require modules
const { sign, verify } = require('jsonwebtoken')

//require Models
const { User } = require('../models')

//variables
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

module.exports = {
    getUserByEmail: async (email) => {
        try { // try to find the user by the provided user email.
            const user = await User.findAll({
                where: {
                    email
                }
            })
            if (user.length > 0) { //if found, return success response with the user object
                return {
                    status: 1,
                    message: "User found",
                    content: user[0]
                }
            }
            else { //if user not found, then return error message
                return {
                    status: 0,
                    message: "User not found",
                    content: {}
                }
            }
        }
        catch (err) { //if error occured, then return the error.
            return {
                status: 0,
                message: "Error Occured.",
                content: err
            }
        }
    },
    getUserById: async (id) => {
        try {// try to find the user by the provided user id.
            const user = await User.findAll({
                where: {
                    id
                }
            })
            if (user.length > 0) { //if found, return success response with the user object
                return {
                    status: 1,
                    message: "User found",
                    content: user[0]
                }
            }
            else { //if user not found, then return error message
                return {
                    status: 0,
                    message: "User not found",
                    content: {}
                }
            }
        }
        catch (err) {  //if error occured, then return the error.
            return {
                status: 0,
                message: "Error Occured.",
                content: err
            }
        }


    },
    checkUserExists: async (email) => {
        try {  //check to find the user with provided email
            const user = await User.findAll({
                where: {
                    email
                }
            });
            return user.length > 0; //if found, send true, else return false
        }
        catch (err) {
            return { //if error occured, return the error 
                status: 0,
                message: err.message,
                content: {}
            }
        }

    },
    createAccessToken: (payload) => {
        return sign( //generating a access token
            payload
            , process.env.JWT_SECRET_ACCESS_TOKEN, {
            expiresIn: JWT_ACCESS_EXPIRES_IN
        });
    },
    createRefreshToken: (payload) => {
        return sign( //generating a refresh token
            payload
            , process.env.JWT_SECRET_REFRESH_TOKEN, {
            expiresIn: JWT_REFRESH_EXPIRES_IN
        });
    },
    updateRefreshToken: async (userId, refreshToken) => {
        try { //try to update the user in database with the new refresh token.
            const update = await User.update({
                refreshToken
            }, {
                where: {
                    id: userId
                }
            })
            return {  //if update success, return success response
                status: 1,
                message: "Refresh Token Update Successful.",
                content: update
            }
        }
        catch (err) {//if update failed, return error response
            return {
                status: 0,
                message: err.message,
                content: {}
            }
        }
    },
    revokeRefreshToken: async (userId) => {
        try {// try to update the refreshToken of a user to ""
            const update = User.update({
                refreshToken: ""
            }, {
                where: {
                    id: userId
                }
            })
            return { //if success return the update response.
                status: 1,
                message: "Token revoked successfully.",
                content: update
            }
        }
        catch (err) { //if failed, send the error response
            console.log(err)
            return {
                status: 0,
                message: err.message,
                content: {}
            }
        }
    },
    decodeAccessToken: (token) => {
        // try to decode the access token 
        try {//if decode is success return the decoded user.
            const user = verify(token, process.env.JWT_SECRET_ACCESS_TOKEN);
            return user;
        } catch (err) { //if access token decoding failed, 
            return { //then send the error message as response
                status: 0,
                message: err.message,
                content: {}
            }
        }

    },
    verifyRefreshToken: async (refreshToken) => {
        try {
            // decode the refresh token from client to verify its signature and obtain the user id inside it. 
            const JWTdecode = verify(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN)

            // use that id to retrieve the user from the database.
            var user = await User.findAll({
                where: {
                    id: JWTdecode.id
                }
            })
            user = user[0]; //converting the array into single object      [{ }] =>  { }

            // if the refresh token from client matches with the token in database
            if (refreshToken == user.refreshToken) {
                // console.log(true);
                return {
                    status: 1,
                    message: "Refresh Token Verified.",
                    content: user
                }
            }
            else { //if tokens provided by client and from database not matched
                return {// send a error response with not matched refresh token.
                    status: 0,
                    message: "Refresh Token Not Matched.",
                    content: {}
                }
            }
        }
        catch (err) { //id decode of refresh token failed, send a error message as response.
            return {
                status: 0,
                message: err.message,
                content: {}
            }
        }
    }
}