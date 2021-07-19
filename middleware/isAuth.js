module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn){
        res.redirect('/admin/login');    
    }
    next();
}