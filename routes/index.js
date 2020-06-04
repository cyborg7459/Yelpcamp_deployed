var express = require("express");
var router  = express.Router();
var Campground = require("../models/campgrounds");
var Comment    = require("../models/comments");
var passport = require('passport');
var User = require("../models/users");

//LANDING PAGE
router.get("/", function(req,res){
	res.render('index');
})

//HOME PAGE
router.get("/home",function(req,res){
	res.render('campgrounds/home');
})

//SIGNUP FORM
router.get("/register", function(req,res){
	res.render("register")
})

//USER SIGNUP
router.post("/register", function(req,res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","Successfully Registered !!! Welcome " + req.body.username);
			res.redirect("/campgrounds");
		})
	})
})

//LOGIN FORM
router.get("/login", function(req,res){
	res.render("login", {message : req.flash("error")});
})

//USER LOGIN
router.post("/login", passport.authenticate("local",
	{
		successRedirect : "/campgrounds",
		failureRedirect : "/login",
	}), function(req,res){
});

//LOGOUT ROUTE
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success","Successfully logged out");
	res.redirect("/campgrounds");
})

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;