module.exports = {
    eAdmin: function(req, res, next) {
        console.log("req.user:", req.user)
      if(req.isAuthenticated() && req.user.eAdmin == 1) {
        return next();
      }
      console.log(this.eAdmin);
      
      req.flash('error_msg', "Você precisa ser um Admin");
      console.log(this.eAdmin);
      res.redirect('/');
    }
  };