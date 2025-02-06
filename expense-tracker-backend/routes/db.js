const mongoose = require('mongoose');
const Schema=mongoose.Schema;
const {ObjectId}=require("mongoose");

const userSchema=new Schema({
    email:{type:String,unique:true},
    password:String,
    FirstName:String,
    LastName:String
});

const ExpenseSchema = new mongoose.Schema({
    userId: { type: ObjectId, ref: 'User', required: true },  // Reference to the User model
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    comments: { type: String, default: '' },  // Optional comments
  }, { timestamps: true });

const userModel=mongoose.model("UsersDB",userSchema)
const ExpenseModel = mongoose.model("expenses", ExpenseSchema);

module.exports={userModel,ExpenseModel};