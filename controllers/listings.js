const Listing = require("../models/listing.js")
const {cloudinary} = require("../cloudConfig.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res)=>{
    let allListings = await Listing.find({})
    res.render("listings/index.ejs",{allListings})
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
}

module.exports.createListing = async (req,res)=>{
    let mbxRes = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      }).send()

    let url = req.file.path
    let filename = req.file.filename
    const newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id;
    newListing.image = {url, filename}
    newListing.geometry = mbxRes.body.features[0].geometry
    await newListing.save()
    req.flash("success","New Listing Created!")
    res.redirect("/listings")
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate:{path: "author"}}).populate("owner")
    if(!listing){
        req.flash("error","Lisiting you requested doesn't exits")
        res.redirect("/listings")
    }
    res.render("listings/show.ejs",{listing})
}

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id)
    if(!listing){
        req.flash("error","Lisiting you requested doesn't exits")
        res.redirect("/listings")
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250")

    res.render("listings/edit.ejs",{listing,originalImageUrl})
}

module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;

    let delImage = await Listing.findById(id)

    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing})
    if(typeof req.file !== "undefined"){   
        await cloudinary.uploader.destroy(delImage.image.filename)
        let url = req.file.path
        let filename = req.file.filename
        listing.image = {url,filename}
        await listing.save()
    }

    req.flash("success","Listing Updated!")
    res.redirect(`/listings/${id}`)
}

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let delImage = await Listing.findById(id)
    await cloudinary.uploader.destroy(delImage.image.filename)
    await Listing.findByIdAndDelete(id)
    req.flash("del","Listing Deleted")
    res.redirect("/listings")
}