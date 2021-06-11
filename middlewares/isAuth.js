const { verify } = require('jsonwebtoken')

module.exports = {
    isAuth: (req, res, next) => {

        //grab access token from the httponly cookie
        const accessToken = req.cookies.accessToken;
        //check if accesstoken is present.
        //if not give "not logged in" error response
        if (!accessToken) {
            console.log('User not logged in.');
            res.status(403).send({
                status: 0,
                message: "User not logged in.",
                content: {}
            })
        }
        else {//if access token is present
            try {
                //try to decode the accesstoken
                const user = verify(accessToken, process.env.JWT_SECRET_ACCESS_TOKEN)

                if (user) {     //if user decoded
                    next();     //preoceed to next step.
                }
                else { //if user id not decoded from the accessToken
                    res.status(403).send({ //send not authorized error response
                        status: 0,
                        message: "User not authorized.",
                        content: {}
                    })
                }
            } catch (err) { //if accesstoken is not decoded , then
                res.send({ //send the error message response
                    status: 0,
                    message: err.message,
                    content: {}
                })
            }
        }
        // if (!authorization) {
        //     console.log('User not logged in.');
        //     res.status(403).send({
        //         status: 0,
        //         message: "User not logged in.",
        //         content: {}
        //     })
        // } else {
        //     const token = authorization.split(' ')[1];
        //     try {
        //         const user = verify(token, process.env.JWT_SECRET_ACCESS_TOKEN)
        //         // console.log(user.id);
        //         if (user) {
        //             next();
        //         }
        //         else {
        //             res.status(403).send({
        //                 status: 0,
        //                 message: "User not authorized.",
        //                 content: {}
        //             })
        //         }
        //     } catch (err) {
        //         res.send({
        //             status: 0,
        //             message: err.message,
        //             content: {}
        //         })
        //     }

        // }
    }
}