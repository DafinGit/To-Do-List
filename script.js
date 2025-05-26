/* ===================================== */
/*  1. Global Variables & DOM Elements   */
/* ===================================== */

// DOM Elements
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const prioritySelect = document.getElementById('priority-select');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-button');
const clearCompletedButton = document.getElementById('clear-completed-button');
const clearAllButton = document.getElementById('clear-all-button');
const errorMessage = document.getElementById('error-message');
const totalTasksSpan = document.getElementById('total-tasks');
const activeTasksSpan = document.getElementById('active-tasks');
const completedTasksSpan = document.getElementById('completed-tasks');
const toastContainer = document.getElementById('toast-container');
// NEW: Theme toggle button
const themeToggle = document.getElementById('theme-toggle');
// Get the body element to apply the theme class
const body = document.body;


// Application State / Data Storage
let todos = [];
let currentFilter = 'all';
let draggedItemOriginalIndex = null;


/* ===================================== */
/*  2. Data Persistence Functions        */
/* ===================================== */

function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
        todos = todos.map(todo => ({
            text: todo.text,
            completed: todo.completed,
            priority: todo.priority || 'medium'
        }));
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// NEW: Theme persistence functions
/**
 * Loads the saved theme preference from localStorage.
 * @returns {string} The saved theme ('light' or 'dark'), defaults to 'light'.
 */
function loadThemePreference() {
    return localStorage.getItem('theme') || 'light';
}

/**
 * Saves the current theme preference to localStorage.
 * @param {string} theme - The theme to save ('light' or 'dark').
 */
function saveThemePreference(theme) {
    localStorage.setItem('theme', theme);
}


/* ===================================== */
/*  3. UI Rendering & Filtering          */
/* ===================================== */

function getFilteredTodos() {
    if (currentFilter === 'active') {
        return todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        return todos.filter(todo => todo.completed);
    } else {
        return todos;
    }
}

function renderTodos() {
    todoList.innerHTML = '';

    const todosToRender = getFilteredTodos();

    if (todosToRender.length === 0 && todos.length > 0 && currentFilter !== 'all') {
        const noMatchMessage = document.createElement('li');
        Object.assign(noMatchMessage.style, {
            textAlign: 'center',
            fontStyle: 'italic',
            color: 'var(--subtle-text-color)', // Use theme variable
            padding: '20px',
            backgroundColor: 'transparent',
            border: 'none'
        });
        noMatchMessage.textContent = `No ${currentFilter} tasks found.`;
        todoList.appendChild(noMatchMessage);
    } else if (todosToRender.length === 0 && todos.length === 0) {
         const emptyMessage = document.createElement('li');
         Object.assign(emptyMessage.style, {
            textAlign: 'center',
            fontStyle: 'italic',
            color: 'var(--subtle-text-color)', // Use theme variable
            padding: '20px',
            backgroundColor: 'transparent',
            border: 'none'
         });
         emptyMessage.textContent = "Your To-Do list is empty! Add some tasks!";
         todoList.appendChild(emptyMessage);
    }

    todosToRender.forEach((todo) => {
        const listItem = document.createElement('li');
        listItem.draggable = true;
        requestAnimationFrame(() => {
            listItem.classList.add('fade-in');
        });

        const originalIndex = todos.findIndex(item => item === todo);
        listItem.dataset.originalIndex = originalIndex;

        const todoText = document.createElement('span');
        todoText.classList.add('todo-text');
        todoText.textContent = todo.text;
        if (todo.completed) {
            todoText.classList.add('completed');
        }

        const prioritySpan = document.createElement('span');
        prioritySpan.classList.add('todo-priority', `priority-${todo.priority}`);
        prioritySpan.textContent = todo.priority;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('todo-actions');

        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-button');
        const checkIcon = document.createElement('i');
        checkIcon.classList.add('fas', 'fa-check');
        completeButton.appendChild(checkIcon);
        completeButton.title = todo.completed ? 'Mark as Incomplete' : 'Mark as Complete';
        completeButton.dataset.index = originalIndex;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        const trashIcon = document.createElement('i');
        trashIcon.classList.add('fas', 'fa-trash-alt');
        deleteButton.appendChild(trashIcon);
        deleteButton.title = 'Delete To-Do';
        deleteButton.dataset.index = originalIndex;

        actionsDiv.appendChild(completeButton);
        actionsDiv.appendChild(deleteButton);

        listItem.appendChild(todoText);
        listItem.appendChild(prioritySpan);
        listItem.appendChild(actionsDiv);

        setupTodoTextEditing(todoText, listItem, originalIndex, prioritySpan);

        todoList.appendChild(listItem);
    });

    updateTaskCounters();
}

function setupTodoTextEditing(todoText, listItem, originalIndex, prioritySpan) {
    todoText.addEventListener('dblclick', function() {
        if (todoText.contentEditable === 'true') return;

        listItem.draggable = false;

        const originalPriority = todos[originalIndex].priority;
        todoText.dataset.originalPriority = originalPriority;

        todoText.contentEditable = 'true';
        todoText.classList.add('editing');
        todoText.focus();
        document.execCommand('selectAll', false, null);

        const priorityEditSelect = document.createElement('select');
        priorityEditSelect.classList.add('todo-priority-edit');
        ['low', 'medium', 'high'].forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.textContent = p.charAt(0).toUpperCase() + p.slice(1);
            if (p === originalPriority) {
                option.selected = true;
            }
            priorityEditSelect.appendChild(option);
        });
        listItem.replaceChild(priorityEditSelect, prioritySpan);

        priorityEditSelect.addEventListener('change', function() {
            const newPriority = priorityEditSelect.value;
            editTodo(originalIndex, todoText.textContent.trim(), newPriority);
        });
    });

    todoText.addEventListener('blur', function() {
        if (todoText.contentEditable === 'true') {
            const newText = todoText.textContent.trim();
            const activePrioritySelect = listItem.querySelector('.todo-priority-edit');
            const newPriority = activePrioritySelect ? activePrioritySelect.value : todos[originalIndex].priority;

            editTodo(originalIndex, newText, newPriority);
            todoText.contentEditable = 'false';
            todoText.classList.remove('editing');
            listItem.draggable = true;
        }
    });

    todoText.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            todoText.blur();
        }
    });
    todoText.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            todoText.contentEditable = 'false';
            todoText.classList.remove('editing');
            todoText.textContent = todos[originalIndex].text;
            editTodo(originalIndex, todos[originalIndex].text, todoText.dataset.originalPriority);
            todoText.blur();
            listItem.draggable = true;
        }
    });
}

function updateTaskCounters() {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;

    totalTasksSpan.textContent = `Total: ${total}`;
    activeTasksSpan.textContent = `Active: ${active}`;
    completedTasksSpan.textContent = `Completed: ${completed}`;
}

function setFilter(filter) {
    currentFilter = filter;

    filterButtons.forEach(button => {
        if (button.dataset.filter === currentFilter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    renderTodos();
}


/* ===================================== */
/*  4. CRUD Operations                   */
/* ===================================== */

function addTodo() {
    const text = todoInput.value.trim();
    const priority = prioritySelect.value;

    if (text === '') {
        displayError('Please enter a to-do item!');
        return;
    }

    clearError();

    todos.push({ text: text, completed: false, priority: priority });

    saveTodos();
    renderTodos();
    showToast('Task added successfully!', 'success');
    todoInput.value = '';
    prioritySelect.value = 'medium';
}

function toggleComplete(index) {
    if (index >= 0 && index < todos.length) {
        todos[index].completed = !todos[index].completed;
        saveTodos();
        renderTodos();
        showToast(`Task marked as ${todos[index].completed ? 'completed' : 'active'}!`, 'info');
    }
}

function deleteTodo(index) {
    if (index < 0 || index >= todos.length) {
        console.error("deleteTodo: Invalid index provided:", index);
        return;
    }

    const todoTextToDelete = todos[index].text;

    if (!confirm(`Are you sure you want to delete "${todoTextToDelete}"?`)) {
        return;
    }

    const listItemToRemove = todoList.querySelector(`li[data-original-index="${index}"]`);

    if (listItemToRemove) {
        const computedStyle = getComputedStyle(listItemToRemove);
        listItemToRemove.style.setProperty('--initial-height', computedStyle.height);
        listItemToRemove.style.setProperty('--initial-padding-top', computedStyle.paddingTop);
        listItemToRemove.style.setProperty('--initial-padding-bottom', computedStyle.paddingBottom);
        listItemToRemove.style.setProperty('--initial-margin-bottom', computedStyle.marginBottom);
        listItemToRemove.style.setProperty('--initial-border-width', computedStyle.borderTopWidth);

        listItemToRemove.classList.add('fade-out');

        listItemToRemove.addEventListener('animationend', function handler(e) {
            if (e.animationName === 'fadeOut') {
                listItemToRemove.remove();
                todos.splice(index, 1);
                saveTodos();
                renderTodos();
                showToast('Task deleted successfully!', 'error');
            }
            listItemToRemove.removeEventListener('animationend', handler);
        }, { once: true });
    } else {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
        showToast('Task deleted successfully!', 'error');
    }
}


function editTodo(index, newText, newPriority = null) {
    if (index >= 0 && index < todos.length) {
        if (newText === '') {
            deleteTodo(index);
            return;
        }
        todos[index].text = newText;
        if (newPriority !== null) {
            todos[index].priority = newPriority;
        }
        saveTodos();
        renderTodos();
        showToast('Task updated!', 'info');
    }
}

function reorderTodos(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= todos.length ||
        toIndex < 0 || toIndex >= todos.length ||
        fromIndex === toIndex) {
        return;
    }

    const [movedTodo] = todos.splice(fromIndex, 1);
    todos.splice(toIndex, 0, movedTodo);

    saveTodos();
    renderTodos();
    showToast('Task reordered!', 'info');
}


/* ===================================== */
/*  5. Clear List Functions              */
/* ===================================== */

function clearCompletedTodos() {
    const completedItems = Array.from(todoList.querySelectorAll('li')).filter(li => {
        const originalIndex = parseInt(li.dataset.originalIndex);
        return todos[originalIndex] && todos[originalIndex].completed;
    });

    if (completedItems.length === 0) {
        displayError('No completed tasks to clear!');
        return;
    }

    let itemsRemovedCount = 0;
    completedItems.forEach(item => {
        const computedStyle = getComputedStyle(item);
        item.style.setProperty('--initial-height', computedStyle.height);
        item.style.setProperty('--initial-padding-top', computedStyle.paddingTop);
        item.style.setProperty('--initial-padding-bottom', computedStyle.paddingBottom);
        item.style.setProperty('--initial-margin-bottom', computedStyle.marginBottom);
        item.style.setProperty('--initial-border-width', computedStyle.borderTopWidth);

        item.classList.add('fade-out');
        item.addEventListener('animationend', function handler(e) {
            if (e.animationName === 'fadeOut') {
                item.remove();
                itemsRemovedCount++;
                if (itemsRemovedCount === completedItems.length) {
                    todos = todos.filter(todo => !todo.completed);
                    saveTodos();
                    renderTodos();
                    showToast('Completed tasks cleared!', 'success');
                }
            }
            item.removeEventListener('animationend', handler);
        }, { once: true });
    });
}

function clearAllTodos() {
    if (confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
        const allItems = Array.from(todoList.querySelectorAll('li'));
        if (allItems.length === 0) {
            displayError('Your To-Do list is already empty!');
            return;
        }

        let itemsRemovedCount = 0;
        allItems.forEach(item => {
            const computedStyle = getComputedStyle(item);
            item.style.setProperty('--initial-height', computedStyle.height);
            item.style.setProperty('--initial-padding-top', computedStyle.paddingTop);
            item.style.setProperty('--initial-padding-bottom', computedStyle.paddingBottom);
            item.style.setProperty('--initial-margin-bottom', computedStyle.marginBottom);
            item.style.setProperty('--initial-border-width', computedStyle.borderTopWidth);

            item.classList.add('fade-out');
            item.addEventListener('animationend', function handler(e) {
                if (e.animationName === 'fadeOut') {
                    item.remove();
                    itemsRemovedCount++;
                    if (itemsRemovedCount === allItems.length) {
                        todos = [];
                        saveTodos();
                        renderTodos();
                        showToast('All tasks cleared!', 'success');
                    }
                }
                item.removeEventListener('animationend', handler);
            }, { once: true });
        });
    }
}


/* ===================================== */
/*  6. UI Feedback Functions             */
/* ===================================== */

function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}

function clearError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;

    toastContainer.appendChild(toast);

    const animationDuration = 400; // 0.4s
    const displayDuration = 2500; // 2.5s
    const totalDuration = animationDuration * 2 + displayDuration;

    setTimeout(() => {
        toast.remove();
    }, totalDuration + 50);
}


/* ===================================== */
/*  7. Theme Toggling Logic              */
/* ===================================== */

/**
 * Applies the given theme to the document body and updates the toggle icon.
 * @param {string} themeName - 'light' or 'dark'.
 */
function applyTheme(themeName) {
    if (themeName === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
        themeToggle.title = "Switch to Light Mode";
    } else {
        body.classList.remove('dark-theme');
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
        themeToggle.title = "Switch to Dark Mode";
    }
    saveThemePreference(themeName);
}

/**
 * Toggles the current theme between 'light' and 'dark'.
 */
function toggleTheme() {
    const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}


/* ===================================== */
/*  8. Event Listeners                   */
/* ===================================== */

addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
});
todoInput.addEventListener('input', clearError);

todoList.addEventListener('click', function(event) {
    const target = event.target;
    const button = target.closest('button.complete-button') || target.closest('button.delete-button');

    if (!button) return;

    const index = parseInt(button.dataset.index);

    if (isNaN(index)) return;

    if (button.classList.contains('complete-button')) {
        toggleComplete(index);
    } else if (button.classList.contains('delete-button')) {
        deleteTodo(index);
    }
});

filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        setFilter(button.dataset.filter);
    });
});

clearCompletedButton.addEventListener('click', clearCompletedTodos);
clearAllButton.addEventListener('click', clearAllTodos);

todoList.addEventListener('dragstart', function(e) {
    const draggedItem = e.target.closest('li');
    if (!draggedItem) return;

    draggedItemOriginalIndex = parseInt(draggedItem.dataset.originalIndex);
    e.dataTransfer.setData('text/plain', draggedItemOriginalIndex);

    draggedItem.classList.add('dragging');
});

todoList.addEventListener('dragover', function(e) {
    e.preventDefault();
    const targetItem = e.target.closest('li');

    if (targetItem && targetItem !== e.target.closest('.dragging')) {
        todoList.querySelectorAll('li').forEach(item => item.classList.remove('drag-over'));
        targetItem.classList.add('drag-over');
    }
});

todoList.addEventListener('dragleave', function(e) {
    e.target.closest('li')?.classList.remove('drag-over');
});

todoList.addEventListener('drop', function(e) {
    e.preventDefault();

    const targetItem = e.target.closest('li');
    todoList.querySelectorAll('li').forEach(item => item.classList.remove('drag-over'));

    if (targetItem && draggedItemOriginalIndex !== null) {
        const dropTargetOriginalIndex = parseInt(targetItem.dataset.originalIndex);
        reorderTodos(draggedItemOriginalIndex, dropTargetOriginalIndex);
    }
});

todoList.addEventListener('dragend', function(e) {
    e.target.closest('li')?.classList.remove('dragging');
    draggedItemOriginalIndex = null;
    todoList.querySelectorAll('li').forEach(item => item.classList.remove('drag-over'));
});

// NEW: Theme toggle button event listener
themeToggle.addEventListener('click', toggleTheme);


/* ===================================== */
/*  9. Initial Load                      */
/* ===================================== */

// Load the user's preferred theme first, before loading todos
applyTheme(loadThemePreference());

loadTodos();
renderTodos(); // This will now call updateTaskCounters()