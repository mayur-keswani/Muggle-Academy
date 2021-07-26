const Post =require('../model/Post')
const Notice=require('../model/Notice')
const Profile=require('../model/Profile')
const User =require('../model/User')

const pdfDocument =require('pdfkit')
const fs=require('fs')
const path=require('path')

// Type : GET
// Access : Public 
// @Desc :Get Index (Carousel Of Posts)
exports.getIndex=(req,res)=>{
	console.log(req.user)
	Post.find()
		.then(posts=>{
			res.render('users/index',{
				posts:posts,
				isAutherized:(req.user  && req.user.role==='admin')?true : false,
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

			console.log(result);

			res.render('users/notices',{
				isAutherized:(req.user  && req.user.role==='admin')?true : false,
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
	let username=req.body.username
	let notice_id=req.params.notice_id;
	
	Notice.findById(notice_id)
		.then(notice=>{

			res.render('users/notice-detail',{
				notice:notice,
				isAutherized:(req.user  && req.user.role==='admin')?true : false,
				username:username,
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
				isAutherized:(req.user  && req.user.role==='admin')?true : false,
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
				console.log(profile);
				res.render('users/profile',{
					profile:profile,
					isAutherized:(req.user  && req.user.role==='admin')?true : false,
					username:(req.user)? req.user.username :null
				})
			}						
		})
	
}

// Type : POST
// Access : Public
// @Desc : Update/Set Profile on server (Logged-in required)
exports.postUserProfile=(req,res)=>{
	console.log(req.file)
	const profile_pic = (req.file)?rq.file:null
	const college = req.body.college 
	const course = req.body.course
	const semester = req.body.semester
	const contact_no = req.body.contact_no 
	const address = req.body.address

	Profile.findOne({userId:req.user})
		.then(profile=>{
			profile.profile_pic=(profile_pic)?profile_pic.path:null;
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
				console.log(user.archieved.items)
				let notices=user.archieved.items
				res.render('users/archieve',{
					notices:notices,
					isAutherized:(req.user)? true : false,
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