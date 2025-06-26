import React, { useState, useEffect } from "react";
import axios from "axios";
import Auth from "./components/Auth";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import "./App.css";

// Define the base URL for the backend API
const API_URL = "http://localhost:4000/api";

function App() {
  // State to manage authentication token (initially from localStorage)
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  // State to manage user information
  const [user, setUser] = useState(null);
  // State to control which view is displayed (login/register or tasks)
  const [view, setView] = useState(token ? "tasks" : "auth"); // If token exists, go to tasks, otherwise auth
  // State to hold the task being edited
  const [editingTask, setEditingTask] = useState(null);
  // State to trigger a refresh of the task list
  const [refreshTasks, setRefreshTasks] = useState(false);

  // Effect to set up user info if a token is present
  useEffect(() => {
    if (token) {
      // In a real app, you'd decode the token or fetch user profile from backend
      // For simplicity, we'll assume a valid token means user is logged in
      // and simply set the view to tasks.
      setView("tasks");
    } else {
      setView("auth");
    }
  }, [token]);

  // Handle user login
  const handleLogin = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      setToken(res.data.token); // Store token in state
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
      }); // Store user info
      localStorage.setItem("token", res.data.token); // Store token in local storage
      setView("tasks"); // Change view to tasks
    } catch (error) {
      console.error("Login failed:", error.response?.data.msg || error.message);
      alert(
        "Login failed: " + (error.response?.data.msg || "Invalid credentials")
      );
    }
  };

  // Handle user registration
  const handleRegister = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      setToken(res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
      });
      localStorage.setItem("token", res.data.token);
      setView("tasks");
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data.msg || error.message
      );
      alert("Registration failed: " + error.response?.data.msg);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    setToken(null); // Clear token from state
    setUser(null); // Clear user info
    localStorage.removeItem("token"); // Remove token from local storage
    setView("auth"); // Change view back to authentication
    setEditingTask(null); // Clear any editing task
    setRefreshTasks(false); // Reset refresh trigger
  };

  // Handle task creation/update
  const handleTaskSubmit = async (taskData) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (editingTask) {
        // Update existing task
        await axios.put(
          `${API_URL}/tasks/${editingTask._id}`,
          taskData,
          config
        );
        setEditingTask(null); // Clear editing task after update
        alert("Task updated successfully!");
      } else {
        // Create new task
        await axios.post(`${API_URL}/tasks`, taskData, config);
        alert("Task created successfully!");
      }
      setRefreshTasks(!refreshTasks); // Trigger task list refresh
    } catch (error) {
      console.error(
        "Task submit failed:",
        error.response?.data.msg || error.message
      );
      alert(
        "Task submit failed: " +
          (error.response?.data.msg || "Error saving task")
      );
    }
  };

  // Handle editing a task
  const onEdit = (task) => {
    setEditingTask(task); // Set the task to be edited
  };

  // Handle deleting a task
  const onDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        await axios.delete(`${API_URL}/tasks/${id}`, config);
        alert("Task deleted successfully!");
        setRefreshTasks(!refreshTasks);
      } catch (error) {
        console.error(
          "Task deletion failed:",
          error.response?.data.msg || error.message
        );
        alert(
          "Task deletion failed: " +
            (error.response?.data.msg || "Error deleting task")
        );
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Manager</h1>
        {token && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>
      <main className="App-main">
        {view === "auth" && (
          <Auth onLogin={handleLogin} onRegister={handleRegister} />
        )}
        {view === "tasks" && token && (
          <>
            <div className="task-section">
              <TaskForm
                onSubmit={handleTaskSubmit}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
              />
            </div>
            <div className="task-section">
              <TaskList
                token={token}
                refreshTasks={refreshTasks}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
