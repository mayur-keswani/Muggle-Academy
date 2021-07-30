const express=require('express')
const router=express.Router();
const Post=require('../model/Post')

const userController= require('../controller/user');
const isAuthenticated=require('../middleware/isAuthenticated');
const { route } = require('./admin');


router.get('/',userController.getIndex)

router.get('/notices',userController.getNotices)

router.get('/notices/:id',userController.getNoticeDetail)
router.get('/download-notice/:id',userController.getNoticeDownload)

router.get('/photos',userController.getPhotos)

router.get('/profile',isAuthenticated,userController.getUserProfile)

router.post('/profile',isAuthenticated,userController.postUserProfile)


router.get('/archieve/:id',isAuthenticated,userController.getNoticeSaved)
router.get('/archieve',isAuthenticated,userController.getArchieve)

router.get('/course/:id',userController.getCourseDetail)

router.get('/my-courses',isAuthenticated,userController.getMyCourses)
router.get('/purchase-course/:id',isAuthenticated,userController.getPurchaseCourse);;

router.get('/course-content/:id',isAuthenticated,userController.getCourseContent)
router.get('/play-video/:id',isAuthenticated,userController.getVideoPlayer)
module.exports=router