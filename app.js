const express=require("express");
const app=express();
const mongoose=require("mongoose");
const mongourl="mongodb://127.0.0.1:27017/wanderlust";
const Listing=require("./models/listing");
const path=require("path");
const exp = require("constants");
const methodOverride = require('method-override');
const ejsMate=require("ejs-mate");
main()
.then((res)=>{
    console.log("connect to db");
})
.catch(err=>{console.log(err)});
async function main(){
    await mongoose.connect(mongourl);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("hi i am root");
});

// app.get("/testlisting",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"Home",
//         description:"the home near salt lake cc1",
//         price:500,
//         location:"Near 8 no water tank",
//         country:"India"
//     });
//    await sampleListing.save();
//    res.send("Saved sussfully");
// });

// index route
app.get("/listings",async(req,res)=>{
 const alllistings=await Listing.find({});
 res.render("listings/index.ejs",{listings:alllistings});

});
// new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
// show route
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
   const listing=await Listing.findById(id);
   res.render("listings/show.ejs",{listing});
});
// create route
app.post("/listings",async(req,res)=>{
    const listing=new Listing(req.body.listing);
   await listing.save();
   res.redirect("/listings");
});
// eidt route
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
   const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});
app.put("/listings/:id",async(req,res)=>{
    let {id}=req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.listing});
   res.redirect(`/listings/${id}`);

});
// delete
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
 let deletedlisting=await Listing.findByIdAndDelete(id);
 console.log(deletedlisting);
 res.redirect("/listings");

});
app.listen(8080,(req,res)=>{
    console.log("App is listing to 8080");
});