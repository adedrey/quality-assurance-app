const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const errorController = require('./controllers/error');
const path = require('path');
const usersRouter = require('./routes/users')
const adminRouter = require('./routes/admin');
const utilPath = require('./util/path');
const app = express();
const MongoDB_URI = 'mongodb://127.0.0.1:27017/afit';
const moment = require('moment');
const Admin = require('./models/auth');
const authRouter = require('./routes/auth');
const csurf = require('csurf');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: MongoDB_URI,
    collection: 'sessions'
});
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({
    extended: false
}))
const csrfProtection = csurf();

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(csrfProtection);
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(utilPath, 'public')));


app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrf = req.csrfToken();
    next();
})
app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    Admin.findOne({
            _id: req.session.user._id
        })
        .then(user => {
            if (!user) {
                return res.redirect('/admin/login');
            }
            req.user = user;
            next();
        })
        .catch(err => {

            next(new Error(err));
        })
})


app.use('/admin', adminRouter);
app.use(usersRouter);
app.use(authRouter);
app.use(errorController.get404);
app.use((error, req, res, next) => {

    res.status(500).render('500', {
        path: '/500',
        pagetitle: 'Service Unavilable',
        csrf: req.csrfToken(),
        isAuthenticated: req.session.isLoggedIn
    });
})

mongoose.connect(MongoDB_URI)
    .then(connect => {
        app.listen(8080);
    }).catch(err => {
        next(new Error(err));
    });