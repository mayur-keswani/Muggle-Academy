const fs=require('fs')

exports.deleteFileHandler=(filePath)=>{
	fs.unlink(filePath,err=>{
		if(err)
			console.log("Unable to delete file...")
		else
			console.log("Post successful deleted from internal directory")
	})
}
