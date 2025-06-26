import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TaskItem from "./TaskItem";
import "../TaskList.css";

const API_URL = "http://localhost:4000/api";

function TaskList({ token, refreshTasks, onEdit, onDelete }) {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch tasks from the backend
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        // Parameters for filtering and sorting
        status: filterStatus,
        search: searchTerm,
        sortBy: sortBy,
        sortOrder: sortOrder,
      },
    };
    try {
      const res = await axios.get(`${API_URL}/tasks`, config);
      setTasks(res.data);
    } catch (err) {
      console.error(
        "Error fetching tasks:",
        err.response?.data.msg || err.message
      );
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, searchTerm, sortBy, sortOrder]);

  // Effect to fetch tasks when component mounts or dependencies change
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token, refreshTasks, fetchTasks]);

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  if (loading) return <p className="loading-message">Loading tasks...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (tasks.length === 0)
    return (
      <p className="no-tasks-message">No tasks found. Create a new one!</p>
    );

  return (
    <div className="task-list-container">
      <h2>Your Tasks</h2>
      <div className="controls">
        <div className="filter-search-group">
          <label htmlFor="filterStatus">Filter by Status:</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <label htmlFor="searchTerm">Search Tasks:</label>
          <input
            type="text"
            id="searchTerm"
            placeholder="Search by title or description"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="sort-group">
          <label htmlFor="sortBy">Sort by:</label>
          <select id="sortBy" value={sortBy} onChange={handleSortByChange}>
            <option value="createdAt">Creation Date</option>
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
          </select>

          <label htmlFor="sortOrder">Order:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={handleSortOrderChange}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className="tasks-grid">
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default TaskList;
