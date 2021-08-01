const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./User')

const questionSchema = new Schema({
	userID:{
		type:Schema.Types.ObjectId,
		ref:'User',
		required:false
	},
	courseID:{
		type:Schema.Types.ObjectId,
		ref:'Course'
	},
	username:{
		type:String
	},
	question:{
		type:String,
		required:true
	},
	comments:[
		{
			userID:{
				type:Schema.Types.ObjectId,
				ref:'User',
				
			},
			answer:{
				type:String
			},
			date:{
				type:Date,
				default:Date.now()
			}
		}
	],
	date:{
		type:Date,
		default: Date.now()
	}		
}) 

module.exports= mongoose.model('Question',questionSchema)