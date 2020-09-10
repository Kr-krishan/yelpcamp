var express=require("express");
var router=express.Router();
var passport=require("passport");
var Campground=require("../models/campground");
var Comment=require("../models/comment");
var User=require("../models/user");
var middleware=require("../middleware");


// to get index file of all campgrounds
router.get("/",function(req,res){
	// console.log(req.user);
	Campground.find({},function(err,allCampgrounds){
		if(err || !allCampgrounds){
			req.flash("error","Campgrounds not found");
			console.log("error in finding all campgrounds",err);
			res.redirect("back");
		}else{
// 			send all campgrounds to render in browser
			res.render("campgrounds/index",{campgrounds:allCampgrounds});
		}
	})
	
})

// post new campground and render it to index page
router.post("/",middleware.isLoggedIn,function(req,res){
	var name=req.body.name;
	var price=req.body.price;
	var image=req.body.image;
	var desc=req.body.description;
	var author={
		id:req.user._id,
		username:req.user.username
	};
	var newCampground={
		name:name,
		price:price,
		image:image,
		description:desc,
		author:author
	}
	
	// campgrounds.push(newCampground);
	
	Campground.create(newCampground,function(err,campground){
		if(err || !campground){
			req.flash("error","Item not found");
			console.log("error in creating new campground",err);
			res.redirect("back");
		}else{
			// console.log(campground);
			req.flash("success","Successfully Added new Campground");
			res.redirect("/campgrounds");   // by default it will look for  get request /campgrounds
		}
	})
	
})

// form to fill new campground
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

// show each campgrounds with details 
router.get("/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err || !foundCampground){
			req.flash("error","Campground not found");
			console.log("error in finding campground",err);
			res.redirect("back");
		}else{
			// console.log(foundCampground);
			res.render("campgrounds/show",{campground:foundCampground});
		}
	})
})

// EDIT CAMPGROUND
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err || !foundCampground){
			console.log(err);
			req.flash("error","Campground not found");
			res.redirect("back");
		}else{
			res.render("campgrounds/edit",{campground:foundCampground});
		}
	})
})
// UPDATE CAMPGROUND
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,newCampground){
		if(err || !newCampground){
			console.log(err);
			req.flash("error","Item not found");
			res.redirect("/campgrounds");
		}else{
			req.flash("success","You updated your campground");
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})

// DESTRY CAMPGROUND
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err || !foundCampground){
			req.flash("error","Item not found");
			res.redirect("/campgrounds");
		}else{
			// console.log(foundCampground);
			if(foundCampground.comments.length > 0){
				console.log("true");
				foundCampground.comments.forEach(function(comment){
					Comment.findByIdAndRemove(comment,function(err){
						if(err){
							console.log("err in removing comment",err);
							res.redirect("/campgrounds");
						}
					})
				})
			}
		}
	})
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}else{
			req.flash("success","Successfully removed the Campground");
			res.redirect("/campgrounds");
		}
	})
})

module.exports=router;