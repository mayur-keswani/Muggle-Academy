const Post =require('../model/Post')
const Notice=require('../model/Notice')
const Profile=require('../model/Profile')
const User =require('../model/User')
const Video =require('../model/Video')

const pdfDocument =require('pdfkit')
const fs=require('fs')
const path=require('path')

const cloudinary = require('cloudinary');

const deleteFileHandler=require('../util/imageDeleteHandler')
const Course = require('../model/Course')

// Type : GET
// Access : Public 
// @Desc :Get Index (Carousel Of Posts)
exports.getIndex=(req,res)=>{
	
	let posts;
	let notices;
	let courses;
	Post.find()
		.then(result=>{
			posts=result;
			return Notice.find()
				
		})
		.then(result=>{
			notices=result;
			return Course.find()
		})
		.then(result=>{
			courses=result
			res.render('users/index',{
				posts:posts,
				notices:notices,
				courses:courses,
				isAdmin:(req.user  && req.user.role==='admin')?true : false,
				isAutherized:(req.user)?true : false,
				username:(req.user)? req.user.username :null
			})
		})
		.catch(err=>{
			console.log(err)
		})
	
}


// Type : GET
// Access : Public 
// @Desc : Get Notices
exports.getNotices=(req,res)=>{
	Notice.find()
		.populate('userId')
		.exec((err,notices)=>{
			if(!err){

  			let result = {} 
			result =notices.reduce(function (r, a) {  
        		r[a.date.toDateString()] = r[a.date] || [];
        		r[a.date.toDateString()].push(a);
        		return r;
    		}, Object.create(null));

			res.render('users/notices',{
				isAdmin:(req.user  && req.user.role==='admin')?true : false,
				isAutherized:(req.user)?true : false,
				notices:result,
				username:(req.user)? req.user.username :null
			 })
			}	
		})
		
}


// Type : GET
// Access : Public
// @Desc : Get Particular Notice-in-Detail
exports.getNoticeDetail=(req,res)=>{
	
	let notice_id=req.params.id;
	Notice.findById(notice_id)
		.then(notice=>{
			res.render('users/notice-detail',{
				notice:notice,
				isAdmin:(req.user  && req.user.role==='admin')?true : false,
				isAutherized:(req.user)?true : false,
				
				username:(req.user)? req.user.username :null
			})
		})
		.catch(err=>{
			console.log(err)
		})
}

// Type : GET
// Access : Public
// @Desc : Get Lists Of Posts
exports.getPhotos=(req,res)=>{
	Post.find()
		.then(posts=>{
			res.render('users/photos',{
				isAdmin:(req.user  && req.user.role==='admin')?true : false,
				isAutherized:(req.user)?true : false,
				posts:posts,
				username:(req.user)? req.user.username :null
			})
		})
	
}


// Type : GET
// Access : Public
// @Desc : Get User Profile (Logged-in required)
exports.getUserProfile=(req,res)=>{
	
	Profile
		.findOne({userId:req.user})
		.then(profile=>{
			if(profile)	// profile already existed
			{   
				res.render('users/profile',{
					profile:profile,
					isAdmin:(req.user  && req.user.role==='admin')?true : false,
					isAutherized:(req.user)?true : false,
					username:(req.user)? req.user.username :null
				})
			}						
		})
	
}

// Type : POST
// Access : Public
// @Desc : Update/Set Profile on server (Logged-in required)
const cloudinaryUploader=async(image_path)=>{
	let image_url;
	image_url=await cloudinary.uploader.upload(image_path,(error,result)=>{
				if(!error){
					
					url=result.url
					return url
				}	
				else{			
					console.log(error)
				}
		
	})
	return (image_url)?image_url:null
}
exports.postUserProfile=async(req,res)=>{
	let profile_pic = (req.file)?req.file:null
	const college = req.body.college 
	const course = req.body.course
	const semester = req.body.semester
	const contact_no = req.body.contact_no 
	const address = req.body.address
	let image_url;
	if(profile_pic){
		image_url=await cloudinaryUploader(profile_pic.path)
		deleteFileHandler.deleteFileHandler(profile_pic.path);
	}
	Profile.findOne({userId:req.user})
		.then(profile=>{
			if(image_url){
				profile.profile_pic=image_url.url;
			}
			profile.college = college
			profile.course = course
			profile.semester = semester;
			profile.contact_no = contact_no;
			profile.address = address

			return	profile.save();
		})
		.then(profile=>{
			console.log("Profile is being updated");
			res.redirect('/');
		})
		.catch(err=>{
			console.log(err)
		})

}

// Type : GET
// Access : Public (Loggin-required)
// @Desc : Archieve notice
exports.getNoticeSaved=(req,res)=>{
	let items=[...req.user.archieved.items]
	const newNotice={ noticeId: req.params.id }
	items.push(newNotice);
	let newArchieved={
		items:items
	}
	User.findById(req.user)
		.then(user=>{
			 let index=user.archieved.items.findIndex(e=> e.noticeId == req.params.id)
			 if(index<0){
				user.archieved=newArchieved
			 }
		
			return user.save()
		})
		.then(result=>{
			// alert("SAVED !")
			console.log("Notice saved sucessfully");
			res.redirect('/notices')
		})
		.catch(err=>{
			console.log(err)
		})
}

// Type : GET
// Access : Public
// @Desc : Get Lists Of Saved-Posts (Logged-in required)
exports.getArchieve=(req,res)=>{
	User.findById(req.user)
		.populate('archieved.items.noticeId')
		.exec((err,user)=>{
			if(!err){
				let notices=user.archieved.items
				res.render('users/archieve',{
					notices:notices,
					isAdmin:(req.user  && req.user.role==='admin')?true : false,
					isAutherized:(req.user)?true : false,
					username:(req.user)? req.user.username :null
			})
			}
			
		})
	
}

// Type : GET
// Access : Public	(Logged-in required)
// @Desc : Get pdf-Format for Notice for offline-read
exports.getNoticeDownload=(req,res)=>{
	const notice_id=req.params.id;
		
	Notice.findById(notice_id)
		.populate('userId')
		.exec((err,notice)=>{
				if(!err){
					const notice_name=`notice+${notice_id}`
				const pathname=path.join('public','downloaded_notice',notice_name)
				let pdfDoc=new pdfDocument();

				res.setHeader('Content-Type','application/pdf');
				res.setHeader('Content-Disposition','inline;filename=notice.pdf');


				pdfDoc.pipe(fs.createWriteStream(pathname))
				pdfDoc.pipe(res)
				
				pdfDoc.image('public/assets/gls.png', {
					fit:[150,100],
					align: 'center',
				  });
				  pdfDoc.text("  ");
				pdfDoc.fontSize(25).text("Notice",{underline:true,align:"center"})
				pdfDoc.fontSize(12).text(notice.date)
				pdfDoc.text("  ");
				pdfDoc.text("  ");
				pdfDoc.fontSize(15).text(`Subject:${notice.subject}`,{align:"center"})
				pdfDoc.text("  ");
				pdfDoc.text("  ");
				pdfDoc.text("  ");
				pdfDoc.fontSize(12).text(notice.content,{align:"left"})
				pdfDoc.text("  ");
				pdfDoc.text("  ");
				pdfDoc.text("  ");
				
				pdfDoc.text("  ");
				
				pdfDoc.text("  ");
				pdfDoc.text("  ");
				pdfDoc.text("  ");
				pdfDoc.fontSize(12).text(notice.userId.username,{align:"left"})
				pdfDoc.fontSize(12).text(notice.designation,{underline:true})
				pdfDoc.end();
				}
				
		})

}

// Type : GET
// Access : Public	(Logged-in Not required)
// @Desc : Get Full-Course Description 
exports.getCourseDetail=(req,res)=>{
	Course.findById(req.params.id)
		.populate('content.basic')
		.populate('content.intermediate')
		.populate('content.Advance')
		.then(course=>{
			res.render('users/course-detail',{
				isAdmin:(req.user  && req.user.role==='admin')?true : false,
				isAutherized:(req.user)?true : false,
				username:(req.user)? req.user.username :null,
				course:course
			})
		
		})
}

exports.getMyCourses=(req,res)=>{

	User.findById(req.user)
		.populate('course_enrolled.courseID')
		.exec((error,user)=>{
			if(error){
				throw new Error('Couldnt able to fetch User !')
			}
			res.render('users/my-courses',{
				isAdmin:(req.user  && req.user.role==='admin')?true : false,
				isAutherized:(req.user)?true : false,
				username:(req.user)? req.user.username :null,
				courses:user.course_enrolled
			})
		})
	
}
exports.getPurchaseCourse=(req,res)=>{
	let course;
	console.log(req.params.id)
	Course.findById(req.params.id)
		.then(result=>{
			console.log(result)
			course=result
			return User.findById(req.user)
				
		})
		.then(user=>{
			console.log(course)
			let payload={
				courseID:course._id,
				date:Date.now(),
				price:course.price
			}
			user.course_enrolled.push(payload);
			user.save();
		})
		.then(result=>{
			console.log(result);
			res.redirect('/my-courses')
		})
		.catch(error=>{
			console.log(error)
		})
}

exports.getCourseContent=(req,res)=>{
	Course
		.findById(req.params.id)
		.populate('content.basic')
		.populate('content.intermediate')
		.populate('content.Advance')
		.then(course=>{
			res.render('users/course-content',{
				course:course,
				isAdmin:(req.user)?true : false,
				isAutherized:(req.user)?true : false,
				username:(req.user)? req.user.username :null,

		})
		
	})
}

exports.getVideoPlayer=(req,res)=>{
	
	Video.findById(req.params.id)
		.then(video=>{
			let isEnrolledCourse=req.user.course_enrolled.findIndex(course=>{ course.courseID.toString() === video.courseID});
			if(isEnrolledCourse>=0){
				res.render('users/video-player',{
					video:video,
					isAdmin:(req.user)?true : false,
					isAutherized:(req.user)?true : false,
					username:(req.user)? req.user.username :null,
				})
			}
		})
}