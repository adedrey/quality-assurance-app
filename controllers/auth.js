const Admin = require('../models/auth');
const bcrypt = require('bcryptjs');
const {
    validationResult
} = require("express-validator");
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/admin/login',
        pagetitle: 'Admin Login',
        errorMessage : null,
        oldValue : {
            email : '',
            password : ''
        },
        validationCSS : []
    })
}
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    Admin.findOne({
            email: email
        })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/admin/login',
                    pagetitle: 'AFIT Login',
                    errorMessage: 'Email or Password is invalid',
                    validationCSS: [],
                    oldValue: {
                        email: email,
                    }
                });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        return res.status(422).render('auth/login', {
                            path: '/admin/login',
                            pagetitle: 'AFIT Login',
                            errorMessage: 'Email or Password is invalid',
                            validationCSS: [],
                            oldValue: {
                                email: email,
                            }
                        });
                    }
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    req.session.save(err => {
                        return res.redirect('/admin');
                    })
                })
                .catch(err => {
                    return next(new Error(err));
                })
        })
        .catch(err => {
            return next(new Error(err));
        })

}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        return res.redirect('/admin/login');
    })
}