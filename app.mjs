//jshint esversion:6
import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import mongooseEncryption from "mongoose-encryption";
import * as dotenv from 'dotenv' 

dotenv.config()

const app = express();
app.set('view engine', 'ejs');

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(mongooseEncryption, {secret: process.env.SECRET,  encryptedFields: ['password']}); // có thể thêm các trường mã hoá trong mảng

const User = new mongoose.model("User", userSchema);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", async (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    try {
        await newUser.save({});
        res.render("secrets");  
    } catch (err) {
        console.log(err)
    }
    finally {
         
    }
    
})

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const foundUser = await User.findOne({email: username});
        if(foundUser.password === password) {
            res.render("secrets");
        }
    } catch (err) {
        console.log(err);
    }
})

app.listen(3000, () => {
    console.log("Server started on port 3000")
})