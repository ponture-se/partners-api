const express = require('express');
const router = express.Router();
const fileMW = require('../middlewares/sfMiddlewares/fileMW');
const getSFConnection = require("../middlewares/sfMiddleware");
const auth = require("../controllers/auth");


router.get('/download/:fileId',
            // auth.verifyToken,
            getSFConnection,
            fileMW.downloadFile);


module.exports = router;