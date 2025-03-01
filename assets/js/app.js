// Select DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dueDate = document.getElementById('due-date');
const priority = document.getElementById('priority');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-buttons button');
const searchInput = document.getElementById('search-input');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const clearAllButton = document.getElementById('clear-all');

// Load tasks from local storage
document.addEventListener('DOMContentLoaded', loadTasks);

// Add task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskText = taskInput.value.trim();
  const taskDueDate = dueDate.value;
  const taskPriority = priority.value;
  if (taskText !== '') {
    addTask(taskText, taskDueDate, taskPriority, false);
    saveTaskToLocalStorage(taskText, taskDueDate, taskPriority, false);
    taskInput.value = '';
    dueDate.value = '';
    priority.value = 'low';
  }
});

// Edit, remove, or mark task as complete
taskList.addEventListener('click', (e) => {
  const taskItem = e.target.closest('li');
  if (e.target.classList.contains('remove')) {
    removeTaskFromLocalStorage(taskItem);
    taskItem.remove();
  } else if (e.target.classList.contains('edit')) {
    editTask(taskItem);
  } else if (e.target.classList.contains('complete')) {
    toggleCompleteTask(taskItem);
  }
  updateTaskCount();
});

// Filter tasks
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    filterTasks(button.id);
  });
});

// Search tasks
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  filterTasksBySearch(searchTerm);
});

// Clear all tasks
clearAllButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all tasks?')) {
    taskList.innerHTML = '';
    localStorage.removeItem('tasks');
    updateTaskCount();
  }
});

// Add task to DOM
function addTask(taskText, dueDate, priority, isCompleted = false) {
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="task-info">
      <span>${taskText}</span>
      <span class="due-date">Due: ${dueDate}</span>
      <span class="priority ${priority}">Priority: ${priority}</span>
    </div>
    <button class="complete">${isCompleted ? 'Undo' : 'Complete'}</button>
    <button class="edit">Edit</button>
    <button class="remove">Remove</button>
  `;
  if (isCompleted) {
    li.classList.add('completed');
  }
  taskList.appendChild(li);
  updateTaskCount();
}

// Save task to local storage
function saveTaskToLocalStorage(taskText, dueDate, priority, isCompleted) {
  let tasks = getTasksFromLocalStorage();
  tasks.push({ text: taskText, dueDate, priority, completed: isCompleted });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Get tasks from local storage
function getTasksFromLocalStorage() {
  let tasks;
  if (localStorage.getItem('tasks') === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem('tasks'));
  }
  return tasks;
}

// Load tasks from local storage
function loadTasks() {
  let tasks = getTasksFromLocalStorage();
  tasks.forEach((task) => addTask(task.text, task.dueDate, task.priority, task.completed));
  updateTaskCount();
}

// Remove task from local storage
function removeTaskFromLocalStorage(taskItem) {
  let tasks = getTasksFromLocalStorage();
  const taskText = taskItem.querySelector('.task-info span').textContent;
  tasks = tasks.filter((task) => task.text !== taskText);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Edit task
function editTask(taskItem) {
  const taskText = taskItem.querySelector('.task-info span').textContent;
  const newText = prompt('Edit your task:', taskText);
  if (newText !== null && newText.trim() !== '') {
    taskItem.querySelector('.task-info span').textContent = newText.trim();
    updateTaskInLocalStorage(taskItem);
  }
}

// Update task in local storage
function updateTaskInLocalStorage(taskItem) {
  let tasks = getTasksFromLocalStorage();
  const taskText = taskItem.querySelector('.task-info span').textContent;
  const taskIndex = tasks.findIndex((task) => task.text === taskText);
  tasks[taskIndex].text = taskText;
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Toggle task completion
function toggleCompleteTask(taskItem) {
  taskItem.classList.toggle('completed');
  const isCompleted = taskItem.classList.contains('completed');
  taskItem.querySelector('.complete').textContent = isCompleted ? 'Undo' : 'Complete';
  updateTaskCompletionInLocalStorage(taskItem, isCompleted);
  updateTaskCount();
}

// Update task completion in local storage
function updateTaskCompletionInLocalStorage(taskItem, isCompleted) {
  let tasks = getTasksFromLocalStorage();
  const taskText = taskItem.querySelector('.task-info span').textContent;
  const taskIndex = tasks.findIndex((task) => task.text === taskText);
  tasks[taskIndex].completed = isCompleted;
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Filter tasks by search term
function filterTasksBySearch(searchTerm) {
  const tasks = taskList.querySelectorAll('li');
  tasks.forEach((task) => {
    const text = task.querySelector('.task-info span').textContent.toLowerCase();
    task.style.display = text.includes(searchTerm) ? 'flex' : 'none';
  });
}

// Update task count
function updateTaskCount() {
  const tasks = taskList.querySelectorAll('li');
  const pendingTasks = Array.from(tasks).filter((task) => !task.classList.contains('completed'));
  const completedTasks = Array.from(tasks).filter((task) => task.classList.contains('completed'));
  pendingCount.textContent = `${pendingTasks.length} Pending`;
  completedCount.textContent = `${completedTasks.length} Completed`;
}
