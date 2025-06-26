import React, { useState, useEffect } from "react";
import "../TaskForm.css";

function TaskForm({ onSubmit, editingTask, setEditingTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");

  // Effect to populate form fields when an editingTask is passed
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      // Format deadline date for input type="date"
      setDeadline(
        editingTask.deadline
          ? new Date(editingTask.deadline).toISOString().split("T")[0]
          : ""
      );
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
    } else {
      // Clear form fields when no task is being edited
      setTitle("");
      setDescription("");
      setDeadline("");
      setStatus("pending");
      setPriority("medium");
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      title,
      description,
      deadline: deadline || null,
      status,
      priority,
    };
    onSubmit(taskData); // This function in App.js handles both create and update
    handleClearForm(); // Clear the form after submission
  };

  // Function to clear the form fields and reset editing task
  const handleClearForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setStatus("pending");
    setPriority("medium");
    setEditingTask(null); // Clear editing task from parent state
  };

  return (
    <div className="task-form-container">
      <h2>{editingTask ? "Edit Task" : "Add New Task"}</h2>{" "}
      {/* Dynamic title */}
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Finish project report"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the task"
            rows="3"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="deadline">Deadline</label>
          <input
            type="date"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-button">
            {editingTask ? "Update Task" : "Add Task"}{" "}
            {/* Dynamic button text */}
          </button>
          {editingTask && ( // Show cancel button only when editing
            <button
              type="button"
              className="cancel-button"
              onClick={handleClearForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
