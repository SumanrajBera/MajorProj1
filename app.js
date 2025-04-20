if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const mongoose = require("mongoose")
const express = require("express")
const ExpressError = require("./utils/ExpressError.js")
const method_override = require("method-override");
const ejsMate = require("ejs-mate")
const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")

const app = express()
const path = require("path")

const listingRouter = require("./routes/listings.js")
const reviewRouter = require("./routes/reviews.js")
const userRouter = require("./routes/user.js");
const { error } = require('console');

const DB_URL = process.env.ATLAS_DB_URL

const port = 8080;
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))

app.use(express.urlencoded({extended: true}))
app.use(method_override("_method"))
app.use(express.static(path.join(__dirname,"public")))
app.engine('ejs',ejsMate)


const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600
})

store.on("error", ()=>{
    console.log("Error in Mongo Session Store:",error)
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
}

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

async function main(){
    await mongoose.connect(DB_URL)
}

main()
.then(res => console.log("Connected to DB"))
.catch(err => console.log(err))

// Routes and middleware

app.use((req,res,next)=>{
    res.locals.success = req.flash("success")
    res.locals.del = req.flash("del")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user
    next()
})

app.use("/listings",listingRouter)
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter)


app.all("*",(req,res,next)=>{
    next(new ExpressError(404, "Page not Found"))
})

app.use((err,req,res,next)=>{
    let {statusCode = 500, message} = err
    res.status(statusCode).render("error.ejs",{err})
})

app.listen(port, ()=>{
    console.log("App is listening on port: ",port);
})