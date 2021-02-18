const express = require('express');
const router = express.Router()

const adminController=require('../controller/admin')
const isAuthenticated=require('../middleware/isAuthenticated')

router.get('/upload-post',isAuthenticated,adminController.getUploadPost)
router.post('/upload-post',adminController.postUploadPost)

router.get('/issue-notice',isAuthenticated,adminController.getIssueNotice)
router.post('/issue-notice',adminController.postIssueNotice)
module.exports=router;