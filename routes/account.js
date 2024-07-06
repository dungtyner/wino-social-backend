const express = require('express');
const accountControllers = require('../app/controllers/accountController');
const router = express.Router();

router.post('/signin', accountControllers.SignIn);
router.post('/signup', accountControllers.SignUp);
router.post('/restore-pass', accountControllers.RestorePassword);
router.post('/CheckCodeEmail', accountControllers.CheckCodeEmail);
router.get('/check-is-active', accountControllers.CheckIsActived);
router.get('/sign-out', accountControllers.SignOut);
router.get('/getlistfriendonline', accountControllers.getlistfriendonline);
router.get('/search/keyword', accountControllers.search);
router.get('/:slug_personal*', accountControllers.getPersonalPageWithSlug);

// router.post("/test",accountControllers.test);
// router.get("/test",accountControllers.test);

module.exports = router;
