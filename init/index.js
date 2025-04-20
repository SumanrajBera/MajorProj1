const mongoose = require("mongoose")
const initData = require("./data.js")
const Listing = require("../models/listing.js")


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(MONGO_URL)
}


main()
.then(res => console.log("Connected to DB"))
.catch(err => console.log(err))

const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=> ({...obj, owner: '67fa83bfa72e7ff81c807689'}))
    await Listing.insertMany(initData.data);
    console.log("Data was initialized")
}

initDB()