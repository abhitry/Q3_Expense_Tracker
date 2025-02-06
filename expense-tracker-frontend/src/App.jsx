import  { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
      const data = { 
        email, 
        password, 
        FirstName: firstName,  
        LastName: lastName 
      };
      console.log("Attempting signup with:", data);  
  
      try {
          const response = await axios.post("http://localhost:3000/user/signup", data, {
              headers: { "Content-Type": "application/json" }  
          });
          console.log("Signup response:", response.data);
          alert("Signup successful! Please login.");
          navigate("/login");
      } catch (error) {
          console.error("Signup failed:", error.response?.data || error.message);
          alert("Signup failed! " + (error.response?.data?.msg || "Unknown error"));
      }
  };

    return (
        <div>
            <h2>Signup</h2>
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /><br />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} /><br />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
            
            <div style={{ display: "flex", justifyContent: "left", gap: "10px", marginTop: "10px" }}>
                <button onClick={handleSignup}>Signup</button>
                <button onClick={() => navigate("/login")}>Go to Login</button>
            </div>
        </div>
    );
}

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:3000/user/signin", { email, password });
            localStorage.setItem("token", response.data.token);
            alert("Login successful!");
            navigate("/dashboard");
        } catch (error) {
            alert("Login failed! " + error.response.data.msg);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}


function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [editId, setEditId] = useState(null);
  const token = localStorage.getItem("token");

  const fetchExpenses = async () => {
    if (!token) {
      console.error("Token not found in localStorage");
      return;
    }
    try {
      const response = await axios.get("http://localhost:3000/expense/view", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data.expenses);
      setShowTable(true);
    } catch (error) {
      console.error("Error fetching expenses:", error.response?.data || error.message);
    }
  };

  const addExpense = async () => {
    if (!token) {
      console.error("Token not found in localStorage");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/expense/add_expense",
        { category, amount, comments },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Expense added successfully!");
      setCategory("");
      setAmount("");
      setComments("");
      fetchExpenses(); // Refresh the table
    } catch (error) {
      console.error("Error adding expense:", error.response?.data || error.message);
    }
  };

  const handleEditClick = (expense) => {
    setEditId(expense._id);
    setCategory(expense.category);
    setAmount(expense.amount);
    setComments(expense.comments);
  };

  const updateExpense = async () => {
    if (!token || !editId) return;
    try {
      await axios.put(
        `http://localhost:3000/expense/edit/${editId}`,
        { category, amount, comments },
        { headers: { Authorization: `Bearer ${token}`} }
      );
      alert("Expense updated successfully!");
      setEditId(null);
      setCategory("");
      setAmount("");
      setComments("");
      fetchExpenses(); // Refresh the table
    } catch (error) {
      console.error("Error updating expense:", error.response?.data || error.message);
    }
  };

  const deleteExpense = async (id) => {
    if (!token) return;
    try {
      await axios.delete(`http://localhost:3000/expense/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Expense deleted successfully!");
      fetchExpenses(); // Refresh the table
    } catch (error) {
      console.error("Error deleting expense:", error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h2>Expense Dashboard</h2>

      {/* Inputs for Adding/Editing Expense */}
      <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} /><br />
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} /><br />
      <input type="text" placeholder="Comments" value={comments} onChange={(e) => setComments(e.target.value)} /><br />

      {editId ? (
        <button onClick={updateExpense}>Update Expense</button>
      ) : (
        <button onClick={addExpense}>Add Expense</button>
      )}
      <button onClick={fetchExpenses}>Fetch Expenses</button>

      {/* Expense Table */}
      {showTable && (
        <div>
          <h3>Expenses</h3>
          <table border="1" cellPadding="8" style={{ marginTop: "10px", width: "100%" }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Comments</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{expense.category}</td>
                    <td>${expense.amount}</td>
                    <td>{expense.comments}</td>
                    <td>{new Date(expense.createdAt).toLocaleString()}</td>
                    <td>{new Date(expense.updatedAt).toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleEditClick(expense)}>Edit</button>
                      <button onClick={() => deleteExpense(expense._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>No expenses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
