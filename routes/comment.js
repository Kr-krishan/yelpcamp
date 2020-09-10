var express=require("express");
var router=express.Router({mergeParams: true});
var passport=require("passport");
var Campground=require("../models/campground");
var User=require("../models/user");
var Comment=require("../models/comment");
var middleware=require("../middleware");


// new Comment
router.get("/new",middleware.isLoggedIn,function(req,res){
// 	    here req.params.id becomes null coz we broke the url so user mergeParams:true in express.Route()
		Campground.findById(req.params.id,function(err,foundCampground){
		if(err || !foundCampground){
			req.flash("error","Item not found");
			console.log("error in finding all campgrounds",err);
			res.redirect("back");
		}else{
			res.render("comments/new",{campground:foundCampground});
		}
	})
})

// post comment
router.post("/",middleware.isLoggedIn,function(req,res){
// 	find the campground
	Campground.findById(req.params.id,function(err,campground){
		if(err || !campground){
			console.log(err);
			req.flash("error","Item not found");
			res.redirect("back");
		}else{
			Comment.create(req.body.comment,function(err,comment){
				if(err || !comment){
					console.log(err);
					req.flash("error","something went wrong!!");
					res.redirect("back");
				}else{
					// console.log(req.user);
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success","Added new comment");
					res.redirect("/campgrounds/" + campground._id);
				}
			})
		}
	})
})

// EDIT COMMENT
router.get("/:comment_id/edit",middleware.checkCommentOwnerShip,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err || !foundCampground){
			req.flash("error","campground not found!!!");
			res.redirect("back");
		}else{
			Comment.findById(req.params.comment_id,function(err,foundComment){
				if(err || !foundComment){
					req.flash("error","Comment not found");
					res.redirect("back");
				}else{
					res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
				}
			})
		}
	})
})
// UPDATE COMMENT
router.put("/:comment_id",middleware.checkCommentOwnerShip,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err || !updatedComment){
			console.log(err);
			req.flash("error","Something went wrong!!!");
			res.redirect("back");
		}else{
			req.flash("success","Successfully updated your comment");
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})
// DESTROY COMMENT
router.delete("/:comment_id",middleware.checkCommentOwnerShip,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			console.log(err);
			req.flash("error","Something went wrong");
			res.redirect("back");
		}else{
			req.flash("success","Your comment got deleted");
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})


module.exports=router;