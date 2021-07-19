const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { body } = require('express-validator');

router.get('/', usersController.getHome);
router.post('/complain', [
    body('department')
    .isLength({min : 1})
    .withMessage('Request not sent. Please pick a department!'),
    body('level')
    .isLength({min : 1})
    .withMessage('Request not sent. Please pick a level!'),
    body('subject')
    .isLength({min : 5})
    .withMessage('Request not sent. Subject length must be greater tha 5 characters!'),
    body('message')
    .isLength({min : 15})
    .withMessage('Request not sent. Message body must be greater than 15 charcters!')

], usersController.postStudent);

module.exports = router;