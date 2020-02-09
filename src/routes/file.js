const express = require('express');
const router = express.Router();
const fileMW = require('../middlewares/sfMiddlewares/fileMW');
const getSFConnection = require("../middlewares/sfMiddleware");


router.get('/download',
            // auth.verifyToken,
            getSFConnection,
            fileMW.downloadFile);


module.exports = router;