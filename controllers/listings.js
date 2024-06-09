
const Listing = require("../models/listing");
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_KEY;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const alllistings = await Listing.find({});
  res.render("listings/index.ejs", { listings: alllistings });
};

module.exports.renderNewFrom = (req, res) => {
  //isLoggedIn is for checking is user is logid in or not
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does't exist!");
    res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
let responce=await  geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  })
    .send();


  let url=req.file.path;
  let filename=req.file.filename;
 
   const listing = new Listing(req.body.listing);
   listing.owner = req.user._id;
   listing.image={url,filename};
   listing.geometry=responce.body.features[0].geometry;
   await listing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditfrom = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  let originalImageUrl=listing.image.url;
 originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");
  if (!listing) {
    req.flash("error", "Listing does't exist!");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing ,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  
 let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
 if(typeof req.file!="undefined"){
  let url=req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
  await listing.save();
 }
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedlisting = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
