var express = require("express");
var router  = express.Router();
var Campground = require("../models/campgrounds");
var Comment    = require("../models/comments");
var middleware = require("../middleware")

//CAMPGROUNDS PAGE
router.get("/", function(req,res){
	Campground.find({},function(err,camp){
		if(err){
			console.log(err);
		}
		else{
			res.render('campgrounds/camps', {camps : camp,currentUser: req.user});
		}
	}).sort({name : 1});
})

//ADD CAMPGROUND FORM
router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render('campgrounds/newform');
})

//NEW CAMPGROUND POST ROUTE
router.post("/", middleware.isLoggedIn, function(req,res){
	req.body.description = req.sanitize(req.body.description);
	Campground.create(req.body.camp, function(err,created){
		if(err){
			console.log(err);
		}
		else{
			created.views = 0;
			created.author.id = req.user.id;
			created.author.username = req.user.username;
			created.save();
			req.flash("success","Added new campground")
			res.redirect("/campgrounds");
		}
	})
})

//CAMPGROUND SHOW PAGE
router.get("/:id", function(req,res){
	Campground.findByIdAndUpdate(req.params.id, {$inc : {views : 1}}, function(err,changed){
		if(err){
			console.log(err);
		}
		else{
			changed.save();
		}
	});
	Campground.findById(req.params.id).populate("comments").exec(function(err, camp){
		if(err){
			console.log(err);
		}
		else{
			res.render('campgrounds/show', {camp : camp});
		}
	})
})

//UPDATE CAMPGROUND FORM
router.get("/:id/update", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, function(err,found){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/updateform", {found:found});
		}
	})
})

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(err,result){
		if(err){
			console.log(err)
		}
		else{
			req.flash("success", "Changes saved!!!");
			res.redirect("/campgrounds/"+ req.params.id);
		}
	})
})

//DELETE CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership , function(req,res){
	Campground.findByIdAndDelete(req.params.id, function(err){
		if(err){
			console.log(err);
		}
		else{
			req.flash("success","Campground Deleted")
			res.redirect("/campgrounds")
		}
	})
})

module.exports = router;