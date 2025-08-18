let tasksArray = [];
addTaskToArray();

function addTaskToArray() {
	const addBtn = document.getElementById('addBtn');
	const taskInput = document.getElementById('taskInput');

	addBtn.addEventListener('click', () => {
		if (!taskInput.value.trim()) {
			alert('Enter a valid task');
			return;
		} else {
			const taskName = document.getElementById('taskInput').value;

			const task = {
				title: taskName.trim(),
				status: false,
			};

			tasksArray.push(task);

			localStorage.setItem('todo', JSON.stringify(tasksArray));
			taskInput.value = '';
			rendering();
		}
	});

	taskInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') addBtn.click();
	});
}

function rendering() {
	const taskList = document.getElementById('taskList');
	taskList.innerHTML = ''; // Don't forget this
	for (let index = 0; index < tasksArray.length; index++) {
		const task = tasksArray[index];
		taskList.style.width = 'fit-content';
		taskList.style.padding = '4px';
		const taskItem = document.createElement('li');
		taskItem.style.display = 'flex';
		taskItem.style.alignItems = 'center';
		taskItem.style.gap = '8px';
		const taskCheckbox = document.createElement('input');
		taskCheckbox.setAttribute('type', 'checkbox');

		taskCheckbox.style.cursor = 'pointer';
		taskCheckbox.checked = task.status;
		taskCheckbox.addEventListener('click', () => {
			task.status = taskCheckbox.checked;
			localStorage.setItem('todo', JSON.stringify(tasksArray));
		});

		const taskTitle = document.createElement('p');
		taskTitle.textContent = task.title;
		const delBtn = document.createElement('button');
		delBtn.setAttribute('data-count', index);
		delBtn.textContent = 'X';
		delBtn.style.width = 'fit-content';
		delBtn.style.height = 'fit-content';

		delBtn.addEventListener('click', () => {
			tasksArray.splice(index, 1);
			localStorage.setItem('todo', JSON.stringify(tasksArray));

			/*
			 ** Only ok if todo list is cleared at the start of each render call
			 ** Otherwise List is repeated and listener is reapplied to button
			 */
			rendering();
		});

		taskItem.appendChild(taskCheckbox);
		taskItem.appendChild(taskTitle);
		taskItem.appendChild(delBtn);
		taskList.appendChild(taskItem);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	let savedTasks = [];
	try {
		savedTasks = localStorage.getItem('todo')
			? JSON.parse(localStorage.getItem('todo'))
			: [];
		tasksArray = savedTasks;
		rendering();
	} catch (e) {
		/*
		 ** For removing any unwanted data from local storage if it throws error
		 */
		console.log(new Error(e.message));
		savedTasks = [];
		localStorage.removeItem('todo');
	}
});
