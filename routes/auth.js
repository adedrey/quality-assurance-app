const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check, body } =require("express-validator");

router.get('/admin/login', authController.getLogin);
router.post('/admin/login', [
    check('email')
    .normalizeEmail()
    .trim(),
    body('password')
    .trim()
], authController.postLogin)
router.post('/admin/logout', authController.postLogout);

module.exports = router;
