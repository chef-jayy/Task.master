const express = require("express"); 
const router = express.Router(); 
const { protect } = require("../middlewares/auth"); 
const Task = require("../models/Task"); 


router.post("/", protect, async (req, res) => {
  const { title, description, deadline, status, priority } = req.body; // Destructure task details

  try {
    // Create a new task instance
    const task = new Task({
      user: req.user._id, // Associate task with the authenticated user
      title,
      description,
      deadline,
      status,
      priority,
    });

    // Save the task to the database
    const createdTask = await task.save();
    res.status(201).json(createdTask); // Respond with the created task
  } catch (error) {
    console.error(error.message); // Log error message
    res.status(500).send("Server Error"); // Send generic server error
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user, with filtering and sorting (Phase 3, 5)
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const query = { user: req.user._id }; // Start with filtering by the authenticated user

    // Filtering by status (Phase 5)
    if (req.query.status) {
      query.status = req.query.status; // Add status filter if provided
    }

    // Searching by title or description (Phase 5)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i"); // Case-insensitive regex search
      query.$or = [{ title: searchRegex }, { description: searchRegex }]; // OR condition for title/description
    }

    let tasksQuery = Task.find(query); // Build the query

    // Sorting (Phase 5)
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // Default to ascending

      if (sortBy === "deadline") {
        tasksQuery = tasksQuery.sort({ deadline: sortOrder });
      } else if (sortBy === "priority") {
        // Sorting by priority: high > medium > low
        // This approach sorts alphabetically 'high', 'low', 'medium'
        // A better approach for priority is to assign numeric values or sort client-side after fetching.
        // For simplicity with direct mongoose sort, we use string comparison.
        // If you need strict order (high, medium, low), you might consider a custom sort function in JS after fetching.
        tasksQuery = tasksQuery.sort({ priority: sortOrder });
      } else if (sortBy === "createdAt") {
        // Added createdAt for general sorting
        tasksQuery = tasksQuery.sort({ createdAt: sortOrder });
      }
    } else {
      // Default sort: latest tasks first
      tasksQuery = tasksQuery.sort({ createdAt: -1 });
    }

    const tasks = await tasksQuery.exec(); // Execute the query
    res.json(tasks); // Respond with the tasks
  } catch (error) {
    console.error(error.message); // Log error
    res.status(500).send("Server Error"); // Send generic server error
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a single task by ID (Phase 4 support)
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id); // Find task by ID

    if (!task) {
      return res.status(404).json({ msg: "Task not found" }); // Task not found
    }

    // Ensure the task belongs to the authenticated user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized to view this task" }); // Unauthorized
    }

    res.json(task); // Respond with the task
  } catch (error) {
    console.error(error.message); // Log error
    // Check if the error is due to an invalid ID format
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.status(500).send("Server Error"); // Send generic server error
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task by ID (Phase 4)
// @access  Private
router.put("/:id", protect, async (req, res) => {
  const { title, description, deadline, status, priority } = req.body; // Destructure updated task details

  // Build task fields object
  const taskFields = {};
  if (title) taskFields.title = title;
  if (description) taskFields.description = description;
  if (deadline) taskFields.deadline = deadline;
  if (status) taskFields.status = status;
  if (priority) taskFields.priority = priority;

  try {
    let task = await Task.findById(req.params.id); // Find task by ID

    if (!task) {
      return res.status(404).json({ msg: "Task not found" }); // Task not found
    }

    // Ensure the task belongs to the authenticated user
    if (task.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to update this task" }); // Unauthorized
    }

    // Update the task and return the new document
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true } // Return the updated document
    );

    res.json(task); // Respond with the updated task
  } catch (error) {
    console.error(error.message); // Log error
    // Check if the error is due to an invalid ID format
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.status(500).send("Server Error"); // Send generic server error
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task by ID (Phase 4)
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id); // Find task by ID

    if (!task) {
      return res.status(404).json({ msg: "Task not found" }); // Task not found
    }

    // Ensure the task belongs to the authenticated user
    if (task.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "Not authorized to delete this task" }); // Unauthorized
    }

    // Remove the task
    await Task.deleteOne({ _id: req.params.id }); // Use deleteOne or findByIdAndDelete

    res.json({ msg: "Task removed" }); // Respond with success message
  } catch (error) {
    console.error(error.message); // Log error
    // Check if the error is due to an invalid ID format
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.status(500).send("Server Error"); // Send generic server error
  }
});

module.exports = router; // Export the router
