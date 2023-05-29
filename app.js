const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const catchAsync = require('./utils/catchAsync');
const Joi = require('joi');
const Campground = require("./models/campground");
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const session = require('express-session');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError");
const review = require("./models/review");
const flash = require('connect-flash');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("mongo connection success!!!");
  })
  .catch((err) => {
    console.log("ohh no mongo connection error!!!");
    console.log(err);
  });

app.engine('ejs' , ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const sessionConfig = {
  secret : 'thisisasecret!!',
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 1000*60*60*24*7,

  }
}


app.use(session(sessionConfig))
app.use(flash()); 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.get("/", (req, res) => {
  res.render("home");
});

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews);
app.use(express.static('public'))



app.all('*', (req, res, next)=>{
  next(new ExpressError('Page Not Found!!!', 404))
});
app.use(
  (err, req, res, next)=>{
    const {statusCode = 500, message = 'Something Went Wrong'} = err;
    if (!err.message) {
      err.message - "Oh No, Something Went Wrong!!"
    }
    res.status(statusCode).render('error' , {err});
    //res.send('oh boy, something went wrong!!')
  }
)

app.listen(3000, () => {
  console.log("serving on port 3000!!");
});
