const mongoose = require("mongoose");
const cities = require("./cities.js");

const Campground = require("../models/campground");
const { places, descriptors } = require("./seddHelpers.js");
mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("mongo connection success!!!");
  })
  .catch((err) => {
    console.log("ohh no mongo connection error!!!");
    console.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) +10;
    const camp = new Campground({
      location: `${cities[random1000].city} , ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://images.unsplash.com/photo-1518602164578-cd0074062767?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi, minus laboriosam ratione dolore nulla quibusdam ab quod temporibus hic! Inventore quasi qui est non? Incidunt, aliquam! Nemo corrupti reprehenderit nulla.',
      price
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
