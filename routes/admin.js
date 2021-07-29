const express = require('express');
const router = express.Router()

const adminController=require('../controller/admin')
const isAuthenticated=require('../middleware/isAuthenticated')

router.get('/upload-post',isAuthenticated,adminController.getUploadPost)
router.post('/upload-post',adminController.postUploadPost)

router.get('/issue-notice',isAuthenticated,adminController.getIssueNotice)
router.post('/issue-notice',adminController.postIssueNotice);

router.get('/launch-course',isAuthenticated,adminController.getLaunchCourse);
router.post('/launch-course',isAuthenticated,adminController.postLaunchCourse);
module.exports=router;