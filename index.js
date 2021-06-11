const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const server = express();
const router = require('./routers/router')

//Server Middlewares-----------------------------
server.use(express.json());
server.use(express.urlencoded({
    extended: true
}));
server.use(cookieParser());
server.use(cors({
    origin: '*',
    credentials: true
}));
//-----------------------------------------------


//Server Routes router
server.use('/', router);


//Running Server
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.SERVER_PORT || 3000;
server.listen(PORT, HOST, () => {
    console.log(`Server running at ${HOST}:${PORT}`);
});





