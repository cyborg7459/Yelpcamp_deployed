var Campground = require("../models/campgrounds.js");
var Comment    = require("../models/comments.js");

var middlewareObj = {
	
	checkCommentOwnership : function(req,res,next){
		if(req.isAuthenticated()){
			Comment.findById(req.params.commentid, function(err,comment){
				if(err){
					res.redirect("back");
				}
				else{
					if(comment.author.id.equals(req.user._id)){
						return next();
					}
					else{
						res.send("No permission")
					}
				}
			})
		}
		else{
			res.redirect("/login");
		}
	},
	
	isLoggedIn : function(req,res,next){
		if(req.isAuthenticated()){
			return next();
		}
		req.flash("error", "You need to be Logged In first!!!");
		res.redirect("/login");
	},
	
	checkCampgroundOwnership : function(req,res,next){
	if(req.isAuthenticated()){
			Campground.findById(req.params.id, function(err,foundCamp){
				if(err){
					res.redirect("back");
				}
				else{
					if(foundCamp.author.id.equals(req.user._id)){
						return next();
					}
					else{
						res.redirect("back");
					}
				}
			})
		}
		else{
			res.redirect("login");
		}
	}
	
}

module.exports = middlewareObj;