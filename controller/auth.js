const express=require('express')
const User = require('../model/User')
const Profile =require('../model/Profile')

const bcrypt=require('bcrypt')		// string to hash code

exports.getLogin=(req,res)=>{
	let message=req.flash('error');
	if(message.length>0){
		message=message[0];
	}else{
		message=null
	}
	res.render('auth/login.ejs',{
		message:message
	})
}
exports.postLogin=(req,res)=>{
	const email=req.body.email;
	const password=req.body.password;
	const username=req.body.username

	User.findOne({email:email})
		.then(user=>{
			if(!user){

				req.flash('error','User not existed')
				res.redirect('/signin');
			}
			else{
				bcrypt.compare(password,user.password)
					.then(isMatch=>{
						if(isMatch){
							console.log("You are successfully Logged-In");
							req.session.isLoggedIn=true;
							req.session.user=user;
							req.session.save((err)=>{
								res.redirect('/')
							})
							
						}else{
							req.flash('error','Password is incorrect')
							res.redirect('/signin')
						}
					})
					.catch(error=>{
						console.log(error)
					})
			}
		})
		.catch(error=>{
			console.log(error)
		})

}

exports.getSignup=(req,res)=>{
	let message=req.flash('error');
	if(message.length>0){
		message=message[0];
	}else{
		message=null
	}
	res.render('auth/signup.ejs',{message:message})
}
exports.postSignup=(req,res)=>{
	
	const username=req.body.username;
	const email=req.body.email;
	const password=req.body.password;
	const role=req.body.role
	
	User.findOne({email:email})
		.then(user=>{
			if(user){
				req.flash('error','User already existed')
				res.redirect('/signin')
			}
			else{
				
				bcrypt.hash(password,12)
					.then(hashedPassword=>{
						console.log(hashedPassword)
						const user=new User({
							email:email,
							username:username,
							password:hashedPassword,
							role:role
						})
						 console.log(user)
						 return user.save()
	
					})
					.then(user=>{
						
						req.session.isLoggedIn=true;
						req.session.user=user;
						console.log("SignIn successfully")

						const profile=new Profile({
							userId:user._id,
							username:user.username
						})
						return profile.save()
						
			
					})
					.then(profile=>{
						res.redirect('/');
					})
					.catch(err=>{
						console.log(err)
					})
				
			}
		})
		.catch(error=>{
			console.log(error)
		})
	
}