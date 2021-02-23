const mongoose=require('mongoose');
const User = require('./User');
const Schema=mongoose.Schema;

const postSchema=new Schema({
	userId:{
		type:Schema.Types.ObjectId,
		ref:'User'
	},
	image:{
		type:String,
		required:true
	},
	heading:{
		type:String,
		
	},
	description:{
		type:String
	},
	criterion:{
		type:String,
		
	},
	cloudinary_public_id:{
		type:String
	},

	date:{
		type:Date,
		default:Date.now
	}
})

module.exports=mongoose.model('Post',postSchema)