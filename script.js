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
    try {
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) {
            todos = JSON.parse(storedTodos);
            // Ensure todos is an array and handle potential parsing errors more gracefully
            if (!Array.isArray(todos)) {
                console.warn('Stored todos is not an array. Resetting to empty.');
                todos = [];
            }
            todos = todos.map(todo => ({
                text: todo.text,
                completed: todo.completed || false, // Ensure completed has a default
                priority: todo.priority || 'medium'
            }));
        } else {
            todos = []; // Initialize to empty array if nothing is stored
        }
    } catch (error) {
        console.error("Error loading todos from localStorage:", error);
        showToast("Could not load saved tasks. Storage might be disabled or full.", 'error');
        todos = []; // Default to an empty array on error
    }
}

function saveTodos() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
        console.error("Error saving todos to localStorage:", error);
        showToast("Could not save tasks. Changes might not persist.", 'error');
    }
}

// NEW: Theme persistence functions
/**
 * Loads the saved theme preference from localStorage.
 * @returns {string} The saved theme ('light' or 'dark'), defaults to 'light'.
 */
function loadThemePreference() {
    try {
        const theme = localStorage.getItem('theme');
        return theme || 'light'; // Return 'light' if theme is null or empty
    } catch (error) {
        console.error("Error loading theme preference from localStorage:", error);
        showToast("Could not load saved theme preference.", 'info');
        return 'light'; // Default to 'light' theme on error
    }
}

/**
 * Saves the current theme preference to localStorage.
 * @param {string} theme - The theme to save ('light' or 'dark').
 */
function saveThemePreference(theme) {
    try {
        localStorage.setItem('theme', theme);
    } catch (error) {
        console.error("Error saving theme preference to localStorage:", error);
        showToast("Could not save theme preference.", 'error');
    }
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
        // Add ARIA attributes for completeButton
        completeButton.setAttribute('aria-label', todo.completed ? `Mark task "${todo.text}" as incomplete` : `Mark task "${todo.text}" as complete`);
        completeButton.setAttribute('aria-pressed', todo.completed ? 'true' : 'false');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        const trashIcon = document.createElement('i');
        trashIcon.classList.add('fas', 'fa-trash-alt');
        deleteButton.appendChild(trashIcon);
        deleteButton.title = 'Delete To-Do';
        deleteButton.dataset.index = originalIndex;
        // Add ARIA attribute for deleteButton
        deleteButton.setAttribute('aria-label', `Delete task "${todo.text}"`);

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
        const isCurrentFilter = button.dataset.filter === currentFilter;
        if (isCurrentFilter) {
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
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

        // Update ARIA attributes of the specific button
        const listItem = todoList.querySelector(`li[data-original-index="${index}"]`);
        if (listItem) {
            const completeButton = listItem.querySelector('.complete-button');
            if (completeButton) {
                const todo = todos[index];
                completeButton.setAttribute('aria-label', todo.completed ? `Mark task "${todo.text}" as incomplete` : `Mark task "${todo.text}" as complete`);
                completeButton.setAttribute('aria-pressed', todo.completed ? 'true' : 'false');
                // Also update the title for consistency, as it's used for tooltips
                completeButton.title = todo.completed ? 'Mark as Incomplete' : 'Mark as Complete';
            }
        }
        // It's important to call renderTodos() if the visual representation of the task itself changes (e.g. strikethrough text)
        // or if the task might move between filters.
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

    // Immediately update data source after confirmation
    todos.splice(index, 1);
    saveTodos();

    const listItemToRemove = todoList.querySelector(`li[data-original-index="${index}"]`);

    if (listItemToRemove) {
        // If the list item exists in the current DOM view, animate its removal
        const computedStyle = getComputedStyle(listItemToRemove);
        listItemToRemove.style.setProperty('--initial-height', computedStyle.height);
        listItemToRemove.style.setProperty('--initial-padding-top', computedStyle.paddingTop);
        listItemToRemove.style.setProperty('--initial-padding-bottom', computedStyle.paddingBottom);
        listItemToRemove.style.setProperty('--initial-margin-bottom', computedStyle.marginBottom);
        listItemToRemove.style.setProperty('--initial-border-width', computedStyle.borderTopWidth);

        listItemToRemove.classList.add('fade-out');

        listItemToRemove.addEventListener('animationend', function handler(e) {
            if (e.animationName === 'fadeOut') {
                if (listItemToRemove.parentNode) {
                    listItemToRemove.remove();
                }
                // Crucially, call renderTodos() here to update all indices and counters
                renderTodos();
                showToast('Task deleted successfully!', 'error');
            }
            listItemToRemove.removeEventListener('animationend', handler); // Ensure listener is removed
        }, { once: true });
    } else {
        // If listItemToRemove is null (e.g., not visible due to filtering),
        // log a warning, then re-render and show toast.
        console.warn(`List item for index ${index} not found in current DOM view for animation. Data already updated.`);
        renderTodos(); // Re-render to update UI (counters, etc.)
        showToast('Task deleted. (Item was not in current view)', 'error');
    }
}


function editTodo(index, newText, newPriority = null) {
    if (index >= 0 && index < todos.length) {
        const originalText = todos[index].text;
        if (newText === '') {
            if (originalText !== '') {
                // Revert to original text if the edit resulted in an empty string
                // and the original was not empty.
                todos[index].text = originalText; // Revert
                // Priority should remain as it was or be updated if newPriority was provided
                // during an edit attempt that also cleared the text.
                if (newPriority !== null) {
                    todos[index].priority = newPriority;
                }
                saveTodos();
                renderTodos();
                showToast('Task edit cannot be empty. Reverted to original.', 'warning');
            } else {
                // Original text was also empty. This case is unlikely if tasks are added with text.
                // For now, we can simply do nothing or log it.
                // Or, if we want to delete such an "empty" task:
                // deleteTodo(index);
                // For this implementation, we'll just log and prevent further action.
                console.warn(`Attempted to edit task at index ${index} to empty, but it was already empty. No action taken.`);
                // Make sure to re-render if the priority was being edited along with the empty text.
                if (newPriority !== null && todos[index].priority !== newPriority) {
                    todos[index].priority = newPriority;
                    saveTodos();
                    renderTodos();
                    showToast('Task priority updated, text remains empty.', 'info');
                } else {
                    renderTodos(); // Ensure UI consistency if only text was cleared and then reverted
                }
            }
            return;
        }

        // If newText is not empty, proceed with the update.
        let changed = false;
        if (todos[index].text !== newText) {
            todos[index].text = newText;
            changed = true;
        }
        if (newPriority !== null && todos[index].priority !== newPriority) {
            todos[index].priority = newPriority;
            changed = true;
        }

        if (changed) {
            saveTodos();
            renderTodos();
            showToast('Task updated!', 'info');
        } else {
            // If nothing changed (e.g., submitted original text and priority),
            // we might not need to save/render/toast.
            // However, renderTodos() is called by setupTodoTextEditing blur anyway.
            // For simplicity, current structure re-renders.
            // To optimize, one could skip save/render/toast if !changed.
            renderTodos(); // Ensure editing UI elements are correctly removed
        }
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
    const hasCompletedTasks = todos.some(todo => todo.completed);

    if (!hasCompletedTasks) {
        displayError('No completed tasks to clear!');
        return;
    }

    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    showToast('Completed tasks cleared!', 'success');
}

function clearAllTodos() {
    if (confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
        if (todos.length === 0) {
            displayError('Your To-Do list is already empty!');
            return;
        }

        todos = [];
        saveTodos();
        renderTodos();
        showToast('All tasks cleared!', 'success');
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
setFilter(currentFilter); // Ensure filter buttons ARIA attributes are set on load