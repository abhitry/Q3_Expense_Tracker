const express=require("express");
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Router=express.Router;
let UserRouter=Router();
const bcrypt = require('bcrypt');
const { userModel, ExpenseModel } = require("./db.js");
const {z}=require("zod");
let { JWT_USER_SECRET }=require("../config.js")
let {userMiddleware}=require("../middlewares/user.js")
UserRouter.use(express.json())
const cors = require("cors");
UserRouter.use(cors());

UserRouter.post("/signup",async function(req,res)
{
    console.log("Received request:", req.body);
    const email=req.body.email;
    const password=req.body.password;
    const FirstName=req.body.FirstName;
    const LastName=req.body.LastName;
    //i have used zod for validation and bcrypt to do the hashing part 
    //instead of directly storeing the raw input data into the database.
    const requiredbody=z.object({
        email:z.string().min(5).max(100).email(),
        password:z.string().min(8).max(12),
        FirstName:z.string(),
        LastName:z.string()
    })
    const parsewithsuccess=requiredbody.safeParse(req.body);
    if(!parsewithsuccess.success){
        return res.json({
            msg:"invalid format",
            error:parsewithsuccess.error
        })
    }
    const hashedpassword=await bcrypt.hash(password,5);
    try{
    await userModel.create({
        email:email,
        password:hashedpassword,
        FirstName:FirstName,
        LastName:LastName
    })}
    catch(e){
        return res.json({
            msg: "Failed to connect to the database",
            error: e.message,
        })
    }
    res.json({
        msg:"signup endpoint"
    })
})


UserRouter.post("/signin",async function(req,res)
{
    const {email,password}=req.body;
    const user=await userModel.findOne({
        email:email,
    })
    try{
        const correctuser=await bcrypt.compare(password,user.password)
        if(user && correctuser)//if user is not null and the bcryopt also return true after comaparing
        {
            const token=jwt.sign({
                id:user._id
            },JWT_USER_SECRET)
            res.json({
                token:token
            })
        }
        else{
            res.status(403).json({
                msg:"Incorrect Credentials for signin endpoint"
            })
        }
    }
    catch(e)
    {
        return res.status(500).json({
            msg: "Invalid password - passwrod not matched",
            error: e.message,
        });
    }
})



module.exports = UserRouter;