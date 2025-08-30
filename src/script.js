(function modalCreator() {
	const modal = document.getElementById('projectModal');
	const createBtn = document.getElementById('createProjectBtn');
	const cancelBtn = document.getElementById('cancelProjectBtn');
	const saveBtn = document.getElementById('saveProjectBtn');
	const projectNameInput = document.getElementById('projectNameInput');

	createBtn.addEventListener('click', () => {
		modal.style.display = 'flex';
		projectNameInput.focus();
	});

	cancelBtn.addEventListener('click', () => {
		modal.style.display = 'none';
		projectNameInput.value = '';
	});

	saveBtn.addEventListener('click', () => {
		const projectName = projectNameInput.value.trim();
		if (projectName) {
			let todo = new Todo(projectName);
			modal.style.display = 'none';
			projectNameInput.value = '';
			ProjectManager.add(todo);
			if (ProjectManager.getAll().length > 0) renderProjects();
		}
	});

	projectNameInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') saveBtn.click();
	});

	// Close modal when clicking outside
	window.addEventListener('click', (e) => {
		if (e.target === modal) {
			modal.style.display = 'none';
		}
	});
})();

// Enhanced ID generation system
let counter = 0;

function idGenerator() {
	return `project_${counter++}`;
}

// Initialize counter from existing projects in localStorage
function initializeCounter() {
	const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
	if (storedProjects.length > 0) {
		// Extract counter values from existing IDs and set counter to max + 1
		const counters = storedProjects.map((project) => {
			const match = project.id.match(/project_(\d+)/);
			return match ? parseInt(match[1]) : 0;
		});
		counter = Math.max(...counters, 0) + 1;
	}
}

class Todo {
	constructor(title = 'Todo List') {
		this.title = title;
		this.tasks = [];
		this.id = idGenerator();
	}

	setupEventListeners(container) {
		// Use event delegation on the container
		container.addEventListener('click', (e) => {
			const taskInput = container.querySelector('.taskInput');

			// Handle add button clicks
			if (e.target.classList.contains('addBtn')) {
				const taskText = taskInput.value.trim();

				if (!taskText) {
					taskInput.focus();
					taskInput.style.outlineColor = '#ff4444';
					setTimeout(() => (taskInput.style.outlineColor = ''), 2000);
					return;
				}

				if (taskText.length > 100) {
					alert('Task description too long (max 100 characters)');
					return;
				}

				const task = {
					title: taskText,
					status: false,
					createdAt: new Date().toISOString(),
				};

				this.tasks.push(task);
				ProjectManager.saveToStorage();
				taskInput.value = '';
				this.renderTasks();
			}

			// Handle delete button clicks
			if (e.target.classList.contains('delete-btn')) {
				const taskIndex = parseInt(e.target.dataset.index);
				this.tasks.splice(taskIndex, 1);
				ProjectManager.saveToStorage();
				this.renderTasks();
			}
		});

		// Handle checkbox changes
		container.addEventListener('change', (e) => {
			if (
				e.target.type === 'checkbox' &&
				e.target.classList.contains('task-checkbox')
			) {
				const taskIndex = parseInt(e.target.dataset.index);
				this.tasks[taskIndex].status = e.target.checked;
				ProjectManager.saveToStorage();
			}
		});

		// Handle Enter key in input
		container.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && e.target.classList.contains('taskInput')) {
				container.querySelector('.addBtn').click();
			}
		});
	}

	renderTasks() {
		const taskList = document.querySelector(
			`[data-project-id="${this.id}"] .taskList`
		);
		taskList.innerHTML = '';
		taskList.style.display = 'grid';
		taskList.style.gridTemplateColumns =
			'repeat(auto-fill, minmax(200px, 1fr))';
		taskList.style.gap = '12px';
		taskList.style.width = '100%';
		taskList.style.padding = '4px';

		this.tasks.forEach((task, index) => {
			const taskItem = document.createElement('li');
			taskItem.style.display = 'flex';
			taskItem.style.alignItems = 'center';
			taskItem.style.gap = '8px';
			taskItem.style.minWidth = '0';

			const taskCheckbox = document.createElement('input');
			taskCheckbox.type = 'checkbox';
			taskCheckbox.className = 'task-checkbox';
			taskCheckbox.dataset.index = index;
			taskCheckbox.style.cursor = 'pointer';
			taskCheckbox.style.flexShrink = '0';
			taskCheckbox.checked = task.status;

			const taskTitle = document.createElement('p');
			taskTitle.textContent = capitalizeFirstLetter(task.title);
			taskTitle.style.flex = '1';
			taskTitle.style.minWidth = '0';
			taskTitle.style.wordWrap = 'break-word';
			taskTitle.style.overflowWrap = 'break-word';
			taskTitle.style.hyphens = 'auto';

			const delBtn = document.createElement('button');
			delBtn.className = 'delete-btn';
			delBtn.dataset.index = index;
			delBtn.textContent = '×';
			delBtn.style.width = 'fit-content';
			delBtn.style.height = 'fit-content';
			delBtn.style.cursor = 'pointer';
			delBtn.style.backgroundColor = '#ff4444';
			delBtn.style.color = 'white';
			delBtn.style.border = 'none';
			delBtn.style.borderRadius = '3px';
			delBtn.style.padding = '2px 6px';
			delBtn.style.flexShrink = '0';

			taskItem.appendChild(taskCheckbox);
			taskItem.appendChild(taskTitle);
			taskItem.appendChild(delBtn);
			taskList.prepend(taskItem);
		});
	}
}

// Project management system
const projects = [];

// Debounce utility for localStorage saves
let saveTimeout;
function debouncedSave() {
	clearTimeout(saveTimeout);
	saveTimeout = setTimeout(() => {
		localStorage.setItem('projects', JSON.stringify(projects));
	}, 300);
}

// Utility functions for project manipulation by ID
const ProjectManager = {
	// Find project by ID
	findById(id) {
		return projects.find((project) => project.id === id);
	},

	// Get all projects
	getAll() {
		return [...projects];
	},

	// Add new project
	add(project) {
		projects.push(project);
		this.saveToStorage();
		return project;
	},

	// Update project by ID
	updateById(id, updates) {
		const project = this.findById(id);
		if (project) {
			Object.assign(project, updates);
			this.saveToStorage();
			return project;
		}
		return null;
	},

	// Delete project by ID
	deleteById(id) {
		const index = projects.findIndex((project) => project.id === id);
		if (index !== -1) {
			const deletedProject = projects.splice(index, 1)[0];
			this.saveToStorage();
			return deletedProject;
		}
		return null;
	},

	// Save projects to localStorage with debouncing
	saveToStorage() {
		debouncedSave();
	},

	// Load projects from localStorage
	loadFromStorage() {
		const storedProjects = JSON.parse(
			localStorage.getItem('projects') || '[]'
		);
		projects.length = 0; // Clear current array
		storedProjects.forEach((projectData) => {
			const project = new Todo(projectData.title);
			project.tasks = projectData.tasks || [];
			project.id = projectData.id;
			projects.push(project);
		});
		return projects;
	},
};

// Initialize the system
initializeCounter();
ProjectManager.loadFromStorage();
window.addEventListener('load', () => {
	renderProjects();
});

/* 
=== HOW TO USE THE ID-BASED PROJECT SYSTEM ===

Each todo project now has a unique ID in the format: "project_[counter]"
Example: "project_0"

BASIC USAGE EXAMPLES:

1. Find a specific project:
   const project = ProjectManager.findById('project_0');

2. Update a project's title:
   ProjectManager.updateById('project_0', { title: 'New Title' });

3. Delete a project:
   ProjectManager.deleteById('project_0');

4. Get all projects:
   const allProjects = ProjectManager.getAll();

5. Add a new project programmatically:
   const newProject = new Todo('My Project');
   ProjectManager.add(newProject);


ADVANCED USAGE:

7. Find projects by title:
   const projectsByTitle = ProjectManager.getAll().filter(p => p.title.includes('Work'));

8. Get all incomplete tasks across projects:
   const incompleteTasks = ProjectManager.getAll()
     .flatMap(project => project.tasks.filter(task => !task.status));

9. Update multiple projects:
   ProjectManager.getAll().forEach(project => {
     if (project.title.startsWith('Old')) {
       ProjectManager.updateById(project.id, { title: project.title.replace('Old', 'New') });
     }
   });

*/

// Create initial default project
if (projects.length === 0) {
	ProjectManager.add(new Todo('Default Project'));
}

function renderProjects() {
	const projectContainer = document.getElementById('projectContainer');
	projectContainer.innerHTML = '';
	projectContainer.style.display = 'grid';
	projectContainer.style.gridTemplateColumns =
		'repeat(auto-fill, minmax(400px, 1fr))';
	projectContainer.style.gap = '16px';
	projectContainer.style.width = '100%';

	ProjectManager.getAll().forEach((project) => {
		const todoContainer = document.createElement('div');
		todoContainer.classList.add('todo-container');
		todoContainer.setAttribute('data-project-id', project.id);
		todoContainer.innerHTML = `
			<div class="project-header">
				<h1>✅ ${capitalizeFirstLetter(project.title)}</h1>
				<button class="delete-project-btn" data-project-id="${project.id}">×</button>
			</div>
			<div class="input-group">
				<input
					type="text"
					id="taskInput-${project.id}"
					class="taskInput"
					placeholder="Add a new task..." />
				<button class="addBtn" data-project-id="${project.id}">Add</button>
			</div>
			<ul class="taskList" data-project-id="${project.id}"></ul>
		`;
		projectContainer.prepend(todoContainer);
		project.setupEventListeners(todoContainer);
		project.renderTasks();

		const delProjectBtn = todoContainer.querySelector(
			'.delete-project-btn'
		);
		delProjectBtn.addEventListener('click', () => {
			ProjectManager.deleteById(project.id);
			renderProjects();
		});
	});
}

function capitalizeFirstLetter(text) {
	if (!text) return ''; // handle empty string
	return text.charAt(0).toUpperCase() + text.slice(1);
}
