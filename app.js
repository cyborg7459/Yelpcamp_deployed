const express          = require('express'),
	  app              = express(),
	  bp               = require('body-parser'),
	  mongoose         = require('mongoose'),
	  flash            = require('connect-flash'),
	  methodoverride   = require('method-override'),
	  expressSanitizer = require('express-sanitizer'),
	  passport         = require('passport'),
	  LocalStrategy    = require('passport-local'),
	  Campground       = require('./models/campgrounds.js'),
	  Comment	       = require('./models/comments.js'),
	  User             = require('./models/users.js');

var commentRoutes      = require("./routes/comments"),
	campgroundRoutes   = require("./routes/campgrounds"),
	indexRoutes        = require("./routes/index");

//INITIALIZING AND USING
app.set('view engine','ejs');
app.use(bp.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodoverride("_method"));
app.use(flash());

//DATABASE SETUP
mongoose.connect('mongodb+srv://cyborg:database@1234@cyborg7459-pn1p6.mongodb.net/<dbname>?retryWrites=true&w=majority',  {useNewUrlParser: true, useUnifiedTopology : true}).then(()=>{
	console.log("Connected");
}).catch(err => {
	console.log("ERROR");
})

mongoose.set('useFindAndModify', false);

//AUTHENTICATION SETUP
app.use(require("express-session")({
	secret: "The world is ending",
	resave : false,
	saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//ROUTE FILES USE
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

//PAGE NOT FOUND ROUTE
app.get('*', function(req,res){
	res.send('Page not found')
});

//SERVER RUN
app.listen(process.env.port || 3000, function(){
	console.log("Server running at port 3000");
})