import React from "react";
import "../TaskItem.css"; // Styling for TaskItem component

function TaskItem({ task, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={`task-item ${task.status}`}>
      <h3>{task.title}</h3>
      <p className="task-description">{task.description}</p>
      <div className="task-details">
        <p>
          <strong>Status:</strong>{" "}
          <span className={`status-badge ${task.status}`}>{task.status}</span>
        </p>
        <p>
          <strong>Priority:</strong>{" "}
          <span className={`priority-badge ${task.priority}`}>
            {task.priority}
          </span>
        </p>
        <p>
          <strong>Deadline:</strong> {formatDate(task.deadline)}
        </p>
        <p>
          <strong>Created:</strong> {formatDate(task.createdAt)}
        </p>
      </div>
      <div className="task-actions">
        {/* Buttons for edit and delete will be implemented in Phase 4 */}
        <button className="edit-button" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="delete-button" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
