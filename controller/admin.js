const express=require('express')
const Notice = require('../model/Notice')
const Post=require('../model/Post')

const cloudinary = require('cloudinary');

const deleteFileHandler=require('../util/imageDeleteHandler');
const Course = require('../model/Course');
// Type : GET
// Access : Private (Only For Admin)
// @Desc : Page to Upload Post For Notice-Board
exports.getUploadPost=(req,res)=>{
	res.render('admin/post-upload',{
		isAdmin:(req.user  && req.user.role==='admin')?true : false,
		isAutherized:(req.user)?true : false,
		username:(req.user)? req.user.username :null
	})
}

// Type : POST
// Access : Private (Only For Admin)
// @Desc : Upload Post OnTo The Server
exports.postUploadPost=(req,res)=>{
	console.log("message"+"post going")
	console.log(req.file)
	let image=req.file.path;
	//  image=".concat(image)
	 console.log(image +" is path")
	const heading=req.body.heading;
	const description=req.body.description;
	const criterion=req.body.criterion;
		
	
		cloudinary.uploader.upload(image,(result)=>{
					// console.log(error +" : error")
					console.log(result +": result")
					   deleteFileHandler.deleteFileHandler(image)
					   const post=new Post({
						 	user:req.user,
						 	image:result.secure_url,
						 	heading:heading,
						 	description:description,
						 	criterion:criterion,
						 	cloudinary_public_id:result.public_id
				  		  });
						post.save()
						  .then(result=>{
							  console.log("Post is successfully added:)");
							 
							  res.redirect('/');
						  })
						  .catch(err=>{
							  console.log(err);
						  })
				
			})
	
}

// Type : GET
// Access : Private (Only For Admin)
// @Desc : Get Page to Fill Details/Issue Notice
exports.getIssueNotice=(req,res)=>{
	res.render('admin/issue-notice',{
		isAdmin:(req.user  && req.user.role==='admin')?true : false,
		isAutherized:(req.user)?true : false,
		username:(req.user)? req.user.username :null
	})
}

// Type : POST
// Access : Private (Only For Admin)
// @Desc : Upload Notice To Server
exports.postIssueNotice=(req,res)=>{
	const subject =req.body.subject;
	const content=req.body.content;
	const designation=req.body.designation 

	const notice=new Notice({
		userId:req.user._id,
		subject:subject,
		content:content,
		designation:designation
	})
	notice.save()
		.then(result=>{
			console.log('Notice issued successfully');
			res.redirect('/notices')
		})
		.catch(err=>{
			console.log(err)
		})
}


exports.getLaunchCourse=(req,res)=>{
	res.render('admin/launch-course',{
		isAdmin:(req.user  && req.user.role==='admin')?true : false,
		isAutherized:(req.user)?true : false,
		username:(req.user)? req.user.username :null
	})
}
exports.postLaunchCourse=(req,res,next)=>{
	console.log(req.file)
	const title=req.body.title;
	const description=req.body.description;
	const price=req.body.price;
	const thumbnail=(req.file)?req.file.path:null;
	const tags= req.body.tags.split(',')

	const course = new Course({
		userID:req.user,
		title:title,
		description:description,
		price:price,
		thumbnail:thumbnail,
		tags:tags
	})
	course.save()
		.then(course=>{
			console.log("Course Created Successfully")
			res.redirect('/')
		})
}