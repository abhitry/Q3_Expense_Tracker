const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
require("dotenv").config(); 

const app=express();

const UserRouter = require("./routes/user");
const expenseRouter = require("./routes/expense");

app.use(cors()); 
app.use(express.json());  
app.use("/user",UserRouter);
app.use("/expense",expenseRouter);



async function main(){
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    app.listen(3000);
    console.log("listening on port 3000")
}
main();