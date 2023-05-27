const express=require('express')
const router=express.Router();

const authController=require('../controller/auth')

router.get('/signin',authController.getLogin);
router.post('/signin',authController.postLogin)

router.get('/signup',authController.getSignup)
router.post('/signup',authController.postSignup)

router.get("/forget-password", authController.getForgetPassword);
router.post("/forget-password", authController.postForgetPassword);
router.get("/reset-password/:id", authController.getResetPassword);
router.post("/reset-password/:id", authController.postResetPassword);



router.get('/logout',(req,res)=>{
	req.session.destroy(err=>{
		if(err){

		}
		else{
			res.redirect('/signin')
		}
	})	
})
module.exports=router