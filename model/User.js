const mongoose=require('mongoose');
const Notice = require('./Notice');
const Schema=mongoose.Schema;

const userSchema=new Schema({
	email:{
		type:String,
		required:true
	},
	password:{
		type:String,
		required:true,
	},
	username:{
		type:String,
		required:true,
	},
	role:{
		type:String,
		required:true
	},
	date:{
		type:Date,
		default:Date.now
	},
	course_enrolled:[{
		courseID:{
			type:Schema.Types.ObjectId,
			ref:'Course'
		},
		date:{
			type:Date,
			default:Date.now
		},
		price:{
			type:Number
		}
	}],
	archieved:{
		items:[{
			noticeId:{
				type:Schema.Types.ObjectId,
				ref:Notice
			}
		}]
	}
})

module.exports=mongoose.model('User',userSchema);