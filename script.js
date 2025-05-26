// 1. Get DOM Elements
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');

// 2. Data Storage
// 'todos' will be an array of objects: [{ text: 'Learn JS', completed: false }, ...]
let todos = [];

// 3. Functions

// Load todos from localStorage when the page loads
function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        // Parse the JSON string back into a JavaScript array
        todos = JSON.parse(storedTodos);
    }
}

// Save current todos array to localStorage
function saveTodos() {
    // Convert the JavaScript array into a JSON string before saving
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Render (display) all todos to the DOM
function renderTodos() {
    todoList.innerHTML = ''; // Clear existing list items before re-rendering

    todos.forEach((todo, index) => {
        const listItem = document.createElement('li');

        // Create the span for the todo text
        const todoText = document.createElement('span');
        todoText.classList.add('todo-text');
        todoText.textContent = todo.text; // Set the text content
        // Add 'completed' class if the todo is marked as complete
        if (todo.completed) {
            todoText.classList.add('completed');
        }

        // Create a div for action buttons (complete and delete)
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('todo-actions');

        // Create the Complete button
        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-button');
        completeButton.textContent = '✓'; // Checkmark icon
        completeButton.title = todo.completed ? 'Mark as Incomplete' : 'Mark as Complete';
        completeButton.dataset.index = index; // Store the index to identify which todo to toggle

        // Create the Delete button
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.textContent = '✗'; // 'X' icon
        deleteButton.title = 'Delete To-Do';
        deleteButton.dataset.index = index; // Store the index to identify which todo to delete

        // Append elements to the list item
        listItem.appendChild(todoText);
        actionsDiv.appendChild(completeButton);
        actionsDiv.appendChild(deleteButton);
        listItem.appendChild(actionsDiv);

        // Append the new list item to the main todo list
        todoList.appendChild(listItem);
    });
}

// Function to add a new todo item
function addTodo() {
    const text = todoInput.value.trim(); // Get input value and remove leading/trailing whitespace

    if (text === '') {
        alert('Please enter a to-do item!'); // Basic validation
        return;
    }

    // Add new todo object to the 'todos' array
    todos.push({ text: text, completed: false });

    saveTodos();    // Save the updated array to localStorage
    renderTodos();  // Re-render the list to show the new item
    todoInput.value = ''; // Clear the input field
}

// Function to toggle the 'completed' status of a todo
function toggleComplete(index) {
    if (index >= 0 && index < todos.length) { // Ensure index is valid
        todos[index].completed = !todos[index].completed; // Toggle the boolean status
        saveTodos();    // Save changes
        renderTodos();  // Re-render to update the display (e.g., strike-through)
    }
}

// Function to delete a todo item
function deleteTodo(index) {
    if (index >= 0 && index < todos.length) { // Ensure index is valid
        todos.splice(index, 1); // Remove 1 element at the given index
        saveTodos();    // Save changes
        renderTodos();  // Re-render the list
    }
}

// 4. Event Listeners

// Listen for clicks on the 'Add To-Do' button
addButton.addEventListener('click', addTodo);

// Allow adding a todo when the Enter key is pressed in the input field
todoInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
});

// Use event delegation for complete and delete buttons.
// Instead of adding a listener to *each* button (which are dynamically created),
// add one listener to their common parent (the <ul>).
// Then, determine which button was clicked using event.target.
todoList.addEventListener('click', function(event) {
    const target = event.target; // The actual element that was clicked
    // Get the data-index attribute, convert it to an integer
    const index = parseInt(target.dataset.index);

    // If the clicked element doesn't have a valid index (e.g., it's the <li> itself), do nothing
    if (isNaN(index)) return;

    if (target.classList.contains('complete-button')) {
        toggleComplete(index);
    } else if (target.classList.contains('delete-button')) {
        deleteTodo(index);
    }
});

// 5. Initial Load
// When the page first loads, load any saved todos and render them
loadTodos();
renderTodos();