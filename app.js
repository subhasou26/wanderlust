if(process.env.NODE_ENV!="production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbUrl = process.env.ATLAS_KEY;
const path = require("path");
const exp = require("constants");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listingRouter = require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const userRouter=require("./routes/user.js");
const { error } = require('console');
main()
  .then((res) => {
    console.log("connect to db");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("Error in mongo session", err);
});

const sessionOption={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+24*60*60*100,
    maxAge:24*60*60*100,
    htppOnly:true,
  }
};


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user; 
  next();
});

app.use("/listings", listingRouter);
//review post route
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


//page not found
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});
// middele ware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  //res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, (req, res) => {
  console.log("App is listing to 8080");
});
