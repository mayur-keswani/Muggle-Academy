const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./User')

const courseSchema = new Schema({
	creator:{
		type:Schema.Types.ObjectId,
		ref:'User'
	},
	title:{
		type:String,
		required:true
	},
	thumbnail:{
		type:String,
		required:true,
	},
	price:{
		type:Number,
		required:true
	},
	description:{
		type:String,
		required:true
	},
	content:{
		basic:[{
			type:Schema.Types.ObjectId,
			ref:'Video'
		}],
		intermediate:[{
			type:Schema.Types.ObjectId,
			ref:'Video'
		}],
		advance:[{
			type:Schema.Types.ObjectId,
			ref:'Video'
		}]
	},
	tags:[String]

}) 

module.exports= mongoose.model('Course',courseSchema)