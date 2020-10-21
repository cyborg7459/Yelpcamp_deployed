var express = require("express");
var router  = express.Router({mergeParams:true});
var Campground = require("../models/campgrounds");
var Comment    = require("../models/comments");
var middleware = require("../middleware")

// NEW COMMENT FORM
router.get("/new", middleware.isLoggedIn, function(req,res){
	Campground.findById(req.params.id, function(err, camp){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/newform", {camp : camp});
		}
	})	
})

// ADDING NEW COMMENT ROUTE
router.post("/", middleware.isLoggedIn, function(req,res){
	Campground.findById(req.params.id, function(err, found){
		if(err){
			console.log(err);
		}
		else{
			Comment.create(req.body.comment, function(err, newcomment){
				if(err){
					console.log(err)
				}
				else{
					newcomment.author.id = req.user._id;
					newcomment.author.username = req.user.username;
					newcomment.save();
					found.comments.push(newcomment);
					found.save();
					req.flash("success","New Comment Added")
					res.redirect("/campgrounds/" + found._id)
				}
			})
		}
	})
})

// UPDATE COMMENT FORM
router.get("/:commentid/edit", checkCommentOwenership, function(req,res){
	Comment.findById(req.params.commentid, function(err,comment){
		if(err){
			res.redirect("back");
		}
		else{
			Campground.findById(req.params.id, function(err,camp){
				if(err){
					console.log(err);
					res.redirect("back");
				}
				else{
					res.render("comments/updateform",{comment:comment, camp:camp})
				}
			})
		}
	})
})

//UPDATING COMMENT ROUTE
router.put("/:commentid", checkCommentOwenership, function(req,res){
	Comment.findByIdAndUpdate(req.params.commentid, req.body.updatedcomment, function(err, newcomment){
		if(err){
			console.log(err);
			res.redirect("back");
		}
		else{
			Campground.findById(req.params.id, function(err, camp){
				if(err){
					console.log(err);
					res.redirect("back");
				}
				else{
					req.flash("Changes Saved !!!")
					res.redirect("/campgrounds/"+ camp._id);
				}
			})
		}
	})
})

// DELETE COMMENT ROUTE
router.delete("/:commentid", checkCommentOwenership, function(req,res){
	Comment.findByIdAndDelete(req.params.commentid, function(err){
		if(err){
			res.redirect("back");
		}
		else{
			req.flash("success","Comment Deleted")
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

// MIDDLEWARE

function checkCommentOwenership(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.commentid, function(err,comment){
			if(err){
				res.redirect("back");
			}
			else{
				if(comment.author.id.equals(req.user._id)){
					next();
				}
				else{
					req.redirect("error","You don't have permission to do so");
					res.redirect("/campgrounds");
				}
			}
		})
	}
	else{
		req.flash("error","You need to be logged first !!!");
		res.redirect("/login");
	}
};

module.exports = router;
