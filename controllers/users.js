const Student = require('../models/student');
const moment = require('moment');

const {
    validationResult
} = require('express-validator');
exports.getHome = (req, res, next) => {
    res.render('users/index', {
        path: '/',
        pagetitle: 'AFIT QAS',
        oldValue: {
            name: '',
            subject: '',
            message: ''
        },
        validationCSS: [],
        errorMessage: null
    });
}
exports.postStudent = (req, res, next) => {
    let name = req.body.name;
    const department = req.body.department;
    const level = req.body.level;
    const subject = req.body.subject;
    const message = req.body.message;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('users/index', {
            path: '/',
            pagetitle: 'AFIT QAS',
            errorMessage: errors.array()[0].msg,
            oldValue: {
                name: name,
                subject: subject,
                message: message
            },
            validationCSS: errors.array()
        })
    }

    if (name === '') {
        name = 'Annonymous';
    }
    const student = new Student({
        name: name,
        department: department,
        level: level,
        subject: subject,
        message: message,
        date: moment().format('MMMM Do YYYY, h:mm:ss a')
    });
    student.save()
        .then(result => {
            return res.status(201).render('users/index', {
                path: '/',
                pagetitle: 'AFIT QAS',
                oldValue: {
                    name: '',
                    subject: '',
                    message: ''
                },
                validationCSS: [],
                errorMessage: 'Your request have been submitted successfully and currently under investigation.'
            })
        })
        .catch(err => {
            return next(new Error(err));
        })
}