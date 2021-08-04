const express=require('express')
const Notice = require('../model/Notice')
const Post=require('../model/Post')

const cloudinary = require('cloudinary');

const deleteFileHandler=require('../util/imageDeleteHandler');
const Course = require('../model/Course');
const Video = require('../model/Video');



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
exports.postUploadPost=(req,res,next)=>{
	let uploadedImage=req.file.path;
	const heading=req.body.heading;
	const description=req.body.description;
	const criterion=req.body.criterion;
		
		cloudinary.v2.uploader.upload(uploadedImage,(error,result)=>{
					
				deleteFileHandler.deleteFileHandler(uploadedImage)
				   const post=new Post({
					 	user:req.user,
					 	image:result.url,
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
						  const error=new Error("Couldn't able to Upload-Post ")
						  console.log(err);
						  next(error)
							  
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
exports.postIssueNotice=(req,res,next)=>{
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
			const error=new Error("Couldn't able to Upload-Notice ")
			console.log(err)
			next(error)
			
		})
}

// Type : GET
// Access : Private (Only For Admin)
// @Desc : Page to Fill Details for Upcoming Course
exports.getLaunchCourse=(req,res)=>{
	res.render('admin/launch-course',{
		isAdmin:(req.user  && req.user.role==='admin')?true : false,
		isAutherized:(req.user)?true : false,
		username:(req.user)? req.user.username :null
	})
}

// Type : POST
// Access : Private (Only For Admin)
// @Desc : Upload Course To Server
exports.postLaunchCourse=(req,res,next)=>{
	const title=req.body.title;
	const description=req.body.description;
	const price=req.body.price;
	const thumbnail=(req.file)?req.file.path:null;
	const tags= req.body.tags.split(',')

	cloudinary.v2.uploader.upload(thumbnail,(error,result)=>{
		
		console.log(result +": result")
		deleteFileHandler.deleteFileHandler(thumbnail)
		const course = new Course({
			creator:req.user,
			title:title,
			description:description,
			price:price,
			thumbnail:result.url,
			tags:tags
		})
	
		course.save()
		.then(course=>{
			console.log("Course Created Successfully")
			res.redirect('/course/'+course._id)
		})
		.catch(err=>{
			const error=new Error("Couldn't able to Create-Course")
			console.log(err)
			next(error)
		})
	})
}


exports.getUploadVideo=(req,res,next)=>{
	Course.findById(req.params.id)
		.then(course=>{
			if(course.creator.toString()===req.user._id.toString()){
				res.render('admin/upload-video',{
					course:course,
					section:req.query.section,
					isAdmin:(req.user  && req.user.role==='admin')?true : false,
					isAutherized:(req.user)?true : false,
					username:(req.user)? req.user.username :null
				})
			}else{
				console.log("You are not autherized")
			}
		}).catch(err=>{
			const error=new Error("Couldn't able to get Uploaded-Video ")
			console.log(err)
			next(error)
		})
}

exports.postUploadVideo=(req,res,next)=>{
	
	const id= req.params.id;
	const title=req.body.title;
	const description=req.body.description;
	const section=req.body.section;
	let uploaded_video=(req.file)?req.file:null;
	let video_url;
	
	// video_url=await cloudinaryUploader(uploaded_video.path)
		
	console.log(uploaded_video)
	cloudinary.v2.uploader.upload(uploaded_video.path,{resource_type: "video"},function(error,result){
		if(result){
			console.log("CLOUDINARI INTIGRATED SUCCESSFULLY")
			video_url=result.url
			console.log(video_url)
			const video=new Video({
				courseID:id,
				title:title,
				description:description,
				url:video_url
				
			})
			deleteFileHandler.deleteFileHandler(uploaded_video.path);
			video.save()
				.then(video=>{
		
					return Course.findById(id)
				})
				.then(course=>{
					if(section==='Basic'){
						console.log(course.content);
						console.log(course.basic);
						course.content.basic.push(video._id)
					}
					else if(section==='Intermediate'){
						
						course.content.intermediate.push(video._id)
					}
					else if(section==='Advance'){
						
						course.content.advance.push(video._id)
					}
					course.save();
				})
				.then((result)=>{
					res.redirect('/')
				})
				.catch(error=>{
					console.log(error)
				})
		}	
		else{			
			const error=new Error("Couldn't able to Upload your Video")
			console.log(error)
			next(error)
		}

	})
		
}