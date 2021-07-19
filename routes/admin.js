const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const Admin = require('../models/auth');
const bcrypt = require('bcryptjs');
const isAuth = require('../middleware/isAuth');
const { body } =require("express-validator");


router.get('/', isAuth, adminController.getIndex);
router.get('/profile', isAuth, adminController.getProfile);
router.get('/report/:reportId', isAuth, adminController.getReport);
router.post('/profile',[
    body('password')
    .custom((value, {req}) => {
        return Admin.findOne({_id: req.user._id})
        .then(user => {
            return bcrypt.compare(value, user.password)
            .then(doMatch => {
                if(!doMatch){
                    return Promise.reject('Password does not match the existing password');
                }
            })
        })
    }),
    body('newpassword')
    .isLength({min : 8})
    .withMessage('Password length must be greater than 8')
    .trim()
    .custom((value, { req}) => {
        if(value !== req.body.confirmpassword)
        {
            throw new Error('Password does not match ');
        }
        return true;
    })
], isAuth, adminController.postProfile);

module.exports = router;