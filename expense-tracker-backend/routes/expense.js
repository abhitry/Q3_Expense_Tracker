const express=require("express");
const Router=express.Router;
let { JWT_USER_SECRET }=require("../config.js")
let expenseRouter=Router();
let {userMiddleware}=require("../middlewares/user.js")
expenseRouter.use(express.json())
const { userModel,ExpenseModel} =require("./db.js")
const cors = require("cors");
expenseRouter.use(cors());

expenseRouter.post("/add_expense",userMiddleware,async function (req,res) {
    const { category, amount, comments } = req.body;
    const userId = req.userId;//task done by the usermiddleware
    if (!category || !amount) {
        return res.status(400).json({ msg: 'Category and amount are required.' });
    }
    const expense = await ExpenseModel.create({
        category:category,
        amount:amount,
        comments:comments,
        userId: userId 
    });
    res.json({
        msg:"expense Created ",
        expenseId:expense._id
    })
})

expenseRouter.get("/view", userMiddleware, async function (req, res) {
  try {
      const expenses = await ExpenseModel.find({ userId: req.userId })
          .sort({ createdAt: -1 }) // Latest first
          .select("category amount createdAt updatedAt comments"); // Only required fields

      res.json({ expenses });
  } catch (error) {
      res.status(500).json({ message: "Error fetching expenses", error });
  }
});
expenseRouter.put("/edit/:id", userMiddleware, async function (req, res) {
  const { category, amount, comments } = req.body;
  const { id } = req.params;
  const userId = req.userId;

  console.log("Editing Expense ID:", id);
  console.log("User ID from Middleware:", userId);

  try {
      const expense = await ExpenseModel.findOne({ _id: id, userId });

      if (!expense) {
          return res.status(404).json({ msg: 'Expense not found or unauthorized' });
      }

      if (category) expense.category = category;
      if (amount) expense.amount = amount;
      if (comments) expense.comments = comments;

      await expense.save();
      res.json({ msg: 'Expense updated successfully', expense });
  } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ msg: 'Error updating expense', error: error.message });
  }
});

expenseRouter.delete('/delete/:id', userMiddleware, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
  
    try {
      const expense = await ExpenseModel.findOne({ _id: id, userId });
  
      if (!expense) {
        return res.status(404).json({ msg: 'Expense not found or unauthorized' });
      }
  
      await expense.deleteOne();
      res.json({ msg: 'Expense deleted successfully' });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error deleting expense', error: error.message });
    }
  });
  
module.exports = expenseRouter;