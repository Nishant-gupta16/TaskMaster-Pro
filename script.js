// To-Do List Application
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.editingTaskId = null;
        this.dailyGoal = 5;
        
        this.init();
    }
    
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
        this.createParticles();
    }
    
    cacheDOM() {
        // Input and buttons
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        
        // Task list and containers
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.loadingState = document.getElementById('loadingState');
        
        // Stats elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
        
        // Progress elements
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.tasksDoneEl = document.getElementById('tasksDone');
        this.productivityScoreEl = document.getElementById('productivityScore');
        
        // Filter and sort
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.sortDateBtn = document.getElementById('sortDateBtn');
        this.sortPriorityBtn = document.getElementById('sortPriorityBtn');
        
        // Modal elements
        this.editModal = document.getElementById('editModalOverlay');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.editDueDate = document.getElementById('editDueDate');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.priorityOptions = document.querySelectorAll('.priority-option');
        
        // Sample task button
        this.sampleTaskBtn = document.querySelector('.sample-task-btn');
        
        // Notification container
        this.notificationContainer = document.getElementById('notificationContainer');
    }
    
    bindEvents() {
        // Task input events
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Clear completed tasks
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.setFilter(e.currentTarget.dataset.filter));
        });
        
        // Sort buttons
        this.sortDateBtn.addEventListener('click', () => this.setSort('date'));
        this.sortPriorityBtn.addEventListener('click', () => this.setSort('priority'));
        
        // Modal events
        this.saveEditBtn.addEventListener('click', () => this.saveEditedTask());
        this.cancelEditBtn.addEventListener('click', () => this.closeModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeModal();
        });
        
        // Priority selection
        this.priorityOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.priorityOptions.forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
        
        // Sample task
        if (this.sampleTaskBtn) {
            this.sampleTaskBtn.addEventListener('click', () => this.addSampleTask());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.taskInput.focus();
            }
        });
    }
    
    createParticles() {
        const container = document.querySelector('.particles-container');
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 20 + 10}s infinite linear;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes floatParticle {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    100% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(360deg); }
                }
            `;
            
            container.appendChild(particle);
            document.head.appendChild(style);
        }
    }
    
    addTask() {
        const text = this.taskInput.value.trim();
        
        if (!text) {
            this.showNotification('error', 'Task cannot be empty!', 'Please enter a task description.');
            return;
        }
        
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: 'medium',
            createdAt: new Date().toISOString(),
            dueDate: null
        };
        
        this.tasks.push(task);
        this.taskInput.value = '';
        this.saveToStorage();
        this.render();
        this.showNotification('success', 'Task added!', 'Your task has been added successfully.');
    }
    
    addSampleTask() {
        const sampleTasks = [
            'Complete project presentation',
            'Buy groceries for the week',
            'Schedule dentist appointment',
            'Finish reading book chapter',
            'Plan weekend activities'
        ];
        
        const randomTask = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];
        
        const task = {
            id: Date.now(),
            text: randomTask,
            completed: false,
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            createdAt: new Date().toISOString(),
            dueDate: null
        };
        
        this.tasks.push(task);
        this.saveToStorage();
        this.render();
        this.showNotification('success', 'Sample task added!', 'A sample task has been added to your list.');
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.render();
            
            const status = task.completed ? 'completed' : 'marked as pending';
            this.showNotification('success', 'Task updated!', `Task has been ${status}.`);
        }
    }
    
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            this.editTaskInput.value = task.text;
            this.editDueDate.value = task.dueDate || '';
            
            // Set priority
            this.priorityOptions.forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.priority === task.priority) {
                    opt.classList.add('active');
                }
            });
            
            this.editModal.style.display = 'flex';
            this.editTaskInput.focus();
        }
    }
    
    saveEditedTask() {
        const text = this.editTaskInput.value.trim();
        
        if (!text) {
            this.showNotification('error', 'Cannot save empty task!', 'Please enter a task description.');
            return;
        }
        
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = text;
            task.priority = document.querySelector('.priority-option.active').dataset.priority;
            task.dueDate = this.editDueDate.value || null;
            
            this.saveToStorage();
            this.render();
            this.closeModal();
            this.showNotification('success', 'Task updated!', 'Your task has been updated successfully.');
        }
    }
    
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveToStorage();
            this.render();
            this.showNotification('success', 'Task deleted!', 'Task has been removed from your list.');
        }
    }
    
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.showNotification('info', 'No completed tasks!', 'There are no completed tasks to clear.');
            return;
        }
        
        if (confirm(`Clear ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveToStorage();
            this.render();
            this.showNotification('success', 'Tasks cleared!', `${completedCount} completed task${completedCount > 1 ? 's' : ''} removed.`);
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        this.filterTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            }
        });
        
        this.render();
    }
    
    setSort(sortType) {
        this.currentSort = sortType;
        
        // Update active sort button
        this.sortDateBtn.classList.remove('active');
        this.sortPriorityBtn.classList.remove('active');
        
        if (sortType === 'date') {
            this.sortDateBtn.classList.add('active');
        } else {
            this.sortPriorityBtn.classList.add('active');
        }
        
        this.render();
    }
    
    getFilteredTasks() {
        let filteredTasks = [...this.tasks];
        
        // Apply filter
        switch (this.currentFilter) {
            case 'pending':
                filteredTasks = filteredTasks.filter(t => !t.completed);
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(t => t.completed);
                break;
            case 'today':
                const today = new Date().toDateString();
                filteredTasks = filteredTasks.filter(t => {
                    if (!t.dueDate) return false;
                    const dueDate = new Date(t.dueDate).toDateString();
                    return dueDate === today;
                });
                break;
        }
        
        // Apply sort
        switch (this.currentSort) {
            case 'date':
                filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
        }
        
        return filteredTasks;
    }
    
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Show loading state briefly
        this.loadingState.style.display = 'block';
        this.taskList.innerHTML = '';
        
        setTimeout(() => {
            this.loadingState.style.display = 'none';
            
            if (filteredTasks.length === 0) {
                this.emptyState.style.display = 'block';
            } else {
                this.emptyState.style.display = 'none';
                
                filteredTasks.forEach(task => {
                    const taskItem = this.createTaskElement(task);
                    this.taskList.appendChild(taskItem);
                });
            }
            
            this.updateStats();
            this.updateProgress();
        }, 300);
    }
    
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
        
        const dueDateText = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">
                        <i class="fas fa-flag"></i> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <span><i class="fas fa-calendar"></i> ${dueDateText}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        return li;
    }
    
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
    }
    
    updateProgress() {
        const completed = this.tasks.filter(t => t.completed).length;
        const todayCompleted = this.tasks.filter(t => {
            if (!t.completed) return false;
            const completedDate = new Date(t.updatedAt || t.createdAt).toDateString();
            const today = new Date().toDateString();
            return completedDate === today;
        }).length;
        
        const progress = Math.min((completed / this.tasks.length) * 100, 100) || 0;
        const dailyProgress = Math.min((todayCompleted / this.dailyGoal) * 100, 100);
        const productivity = Math.min(dailyProgress, 100);
        
        // Animate progress bar
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${Math.round(progress)}% Complete`;
        this.tasksDoneEl.textContent = todayCompleted;
        this.productivityScoreEl.textContent = `${Math.round(productivity)}%`;
        
        // Update daily goal element
        document.getElementById('dailyGoal').textContent = this.dailyGoal;
    }
    
    closeModal() {
        this.editModal.style.display = 'none';
        this.editingTaskId = null;
        this.editTaskInput.value = '';
        this.editDueDate.value = '';
    }
    
    saveToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    showNotification(type, title, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon} notification-icon"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        this.notificationContainer.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TodoApp();
    window.todoApp = app; // Make app available globally for debugging
});