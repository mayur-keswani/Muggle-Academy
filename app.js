const express=require('express')
const app=express();
const bodyparser=require('body-parser')
const mongoose=require('mongoose')
const flash=require('connect-flash');
const session=require('express-session');
const MongoDbStore=require('connect-mongodb-session')(session);
const multer=require('multer')
const User =require('./model/User')
const helmet = require('helmet');
const compression = require('compression');
const cloudinary = require('cloudinary');



require('dotenv').config('./.env')
let db=`mongodb+srv://${process.env.Mongo_USER}:${process.env.Mongo_PASSWORD}@cluster0.gpz6t.mongodb.net/NoticeBoard?retryWrites=true&w=majority`
// Cloud_NAME= process.env.Cloud_NAME
cloudinary.config({ 
	cloud_name:process.env.Cloud_NAME, 
	api_key: process.env.Cloud_API_KEY, 
	api_secret:process.env.Cloud_API_SECRET
  });



const userRoute=require('./routes/user'); 
const adminRoute= require('./routes/admin');
const authRoute= require('./routes/auth');


const port=process.env.PORT || 3000;
const hostname='127.0.0.1';


const store=new MongoDbStore({
	uri:db,
	collection:"session"
})


app.set('view engine','ejs')
app.use(bodyparser.urlencoded({extended:false}))
app.use(express.static('./public'));
app.use(session({
	secret: 'This is a secret',
	resave: true,
	saveUninitialized: true,
	store:store
	}
))
app.use(flash());	// special area of the session used for storing messages
var storage = multer.diskStorage({		
	destination: function (req, file, cb) {
	  cb(null, './public/assets/upload')
	},
	filename: function (req, file, cb) {
	  cb(null, file.originalname + '-' + Date.now() + '.' + file.originalname.split('.')[1])
	}
  })
   
app.use(multer({ storage: storage }).single('myupload'));		// handling multipart/form-data , which is primarily 																	// used for uploading files.
app.use('/public/assets/upload',express.static('./public/assets/upload'))

app.use((req,res,next)=>{
	
	if(!req.session.user){
		return next();
	}
	User.findById(req.session.user)
		.then(user=>{
			// console.log("assigned")
			req.user=user;
			next();
		})
		.catch(err=>{
			console.log(err)

		})
})

app.use(userRoute)
app.use(adminRoute)
app.use(authRoute)

app.use(helmet());      // secure your Express apps by setting various HTTP headers
app.use(compression());

	mongoose.connect(db,{
		useNewUrlParser: true,
		useUnifiedTopology:true
	})
	.then(result=>{
		console.log("Mongodb is connected successfully");
		app.listen(port)
	})
	.catch(error=>{
		console.log(db)
		console.log(error);
	})