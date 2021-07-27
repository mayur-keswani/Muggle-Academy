const express=require('express')
const router=express.Router();

const authController=require('../controller/auth')

router.get('/signin',authController.getLogin);
router.post('/signin',authController.postLogin)

router.get('/signup',authController.getSignup)
router.post('/signup',authController.postSignup)

router.get('/logout',(req,res)=>{
	req.session.destroy(err=>{
		if(err)
			console.log(err)
		else{
			res.redirect('/signin')
		}
	})	
})
module.exports=router