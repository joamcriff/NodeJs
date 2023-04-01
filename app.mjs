//jshint esversion:6
import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import * as dotenv from 'dotenv' 
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

dotenv.config()

const app = express();
app.set('view engine', 'ejs');

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    res.render("home");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/secrets", (req, res) => {
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
})

app.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});

app.post("/register", async (req, res) => {
    await User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err) {
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    })
})

app.post("/login", async (req, res) => {
   const user = new User({
    username: req.body.username,
    password: req.body.password
   });

   try {
        await passport.authenticate("local")(req, res, ()=> {
            res.redirect("/secrets");
        })
   } catch (err) {
        console.log(err);
   }
})

app.listen(3000, () => {
    console.log("Server started on port 3000")
})