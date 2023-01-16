const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const catchAsync = require('./utils/catchAsync');
const Joi = require('joi');
const Campground = require("./models/campground");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError");
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

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
}));

app.get("/campgrounds/new", catchAsync(async (req, res) => {
  res.render("campgrounds/new");
}));

app.post("/campgrounds", catchAsync(async (req, res) => {
  //console.log(req.body.campground);
  const campgroundSchema = Joi.object({
    campground: Joi.object({
      title: Joi.string().required(),
      price: Joi.number().required().min(0),
      image: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required()
    }).required()
  })
  const {error} = campgroundSchema.validate(req.body);
  console.log(result);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  }
  const campground = new Campground(req.body.campground);
  await campground.save();
  //res.send(req.body);
  console.log(campground);
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { campground });
}));

app.get('/campgrounds/:id/edit' , catchAsync(async (req, res ) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { campground });
}));

app.put('/campgrounds/:id' , catchAsync(async (req, res) => {
  //res.send("put route is working!!!");
  const {id} = req.params;
  const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground});
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id' , catchAsync(async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
  console.log("object deleted with id: " , id);
}));
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
