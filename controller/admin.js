const express=require('express')
const Notice = require('../model/Notice')
const Post=require('../model/Post')

// Type : GET
// Access : Private (Only For Admin)
// @Desc : Page to Upload Post For Notice-Board
exports.getUploadPost=(req,res)=>{
	res.render('admin/post-upload',{
		isAutherized:req.user.role==='admin'
	})
}

// Type : POST
// Access : Private (Only For Admin)
// @Desc : Upload Post OnTo The Server
exports.postUploadPost=(req,res)=>{
	
	const image=req.file;
	console.log(image.path)
	const heading=req.body.heading;
	const description=req.body.description;
	const criterion=req.body.criterion;
	const post=new Post({
		user:req.user,
		image:image.path,
		heading:heading,
		description:description,
		criterion:criterion
	})
	post.save()
		.then(result=>{
			console.log("Post is successfully added:)");
			res.redirect('/');
		})
		.catch(err=>{
			console.log(err);
		})

}

// Type : GET
// Access : Private (Only For Admin)
// @Desc : Get Page to Fill Details/Issue Notice
exports.getIssueNotice=(req,res)=>{
	res.render('admin/issue-notice',{
		isAutherized:req.user.role==='admin'
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