"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // State
    // Initialize with some dummy data for immediate visual feedback
    let tasks = [
        {
            id: '1',
            name: 'Breakfast',
            color: 'color-red',
            start: new Date(new Date().setHours(8, 0, 0, 0)),
            end: new Date(new Date().setHours(9, 0, 0, 0)),
            completed: true
        },
        {
            id: '2',
            name: 'Frontend Work',
            color: 'color-green',
            start: new Date(new Date().setHours(10, 0, 0, 0)),
            end: new Date(new Date().setHours(13, 0, 0, 0)),
            completed: false
        }
    ];

    // UI References
    const calendarStrip = document.getElementById('calendarStrip');
    const currentTaskCard = document.getElementById('currentTaskCard');
    const upcomingTaskList = document.getElementById('upcomingTaskList');
    const previousTaskList = document.getElementById('previousTaskList');

    const addTaskBtn = document.getElementById('addTaskBtn');
    const addTaskModal = document.getElementById('addTaskModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addTaskForm = document.getElementById('addTaskForm');

    // Helper to get Color Value from CSS Variable name mapping
    const getColorVar = (className) => {
        const map = {
            'color-green': 'var(--color-green)',
            'color-blue': 'var(--color-blue)',
            'color-orange': 'var(--color-orange)',
            'color-red': 'var(--color-red)'
        };
        return map[className] || 'var(--color-green)';
    };

    const getIconForTask = (name) => {
        const nameLower = name.toLowerCase();
        if (nameLower.includes('meet')) return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        if (nameLower.includes('code') || nameLower.includes('front') || nameLower.includes('back')) return '</>';
        if (nameLower.includes('food') || nameLower.includes('break') || nameLower.includes('dinner')) return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>';
        return name.charAt(0).toUpperCase();
    };

    // Initialization
    renderCalendar();
    renderTasks();

    // Check time every minute
    setInterval(() => {
        renderTasks();
        updateTimeDisplay();
    }, 60000);
    updateTimeDisplay(); // Initial call

    // Event Listeners
    addTaskBtn.addEventListener('click', () => {
        addTaskModal.classList.remove('hidden');
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        document.getElementById('startTime').value = formatTimeForInput(now);
        document.getElementById('endTime').value = formatTimeForInput(nextHour);
    });

    closeModalBtn.addEventListener('click', () => {
        addTaskModal.classList.add('hidden');
    });

    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveNewTask();
    });

    // Global function for onclick handlers
    window.toggleTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            renderTasks();
        }
    };

    function renderCalendar() {
        const today = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Generate last 2 days and next 4 days
        calendarStrip.innerHTML = '';
        for (let i = -2; i <= 4; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const isActive = i === 0;
            const el = document.createElement('div');
            el.className = `date-capsule ${isActive ? 'active' : ''}`;
            el.innerHTML = `
                <span class="date-day">${date.getDate().toString().padStart(2, '0')}</span>
                <span class="date-weekday">${days[date.getDay()]}</span>
            `;
            calendarStrip.appendChild(el);
        }
    }

    function renderTasks() {
        const now = new Date();

        // Sort tasks
        tasks.sort((a, b) => a.start - b.start);

        const currentTask = tasks.find(t => now >= t.start && now <= t.end);
        const upcoming = tasks.filter(t => t.start > now);
        const previous = tasks.filter(t => t.end < now);

        // Render Current
        if (currentTask) {
            const totalDuration = currentTask.end - currentTask.start;
            const elapsed = now - currentTask.start;
            const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

            // Check state for rendering (filled if checked)
            const checkIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

            currentTaskCard.innerHTML = `
                <div class="current-task-name">${currentTask.name}</div>
                <button class="circular-check ${currentTask.completed ? 'checked' : ''}" onclick="toggleTask('${currentTask.id}')">
                    ${currentTask.completed ? checkIcon : ''}
                </button>
                <div class="progress-container">
                    <span class="time-label">${formatTime(currentTask.start)}</span>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${percentage}%; background-color: var(--${currentTask.color})"></div>
                    </div>
                    <span class="time-label">${formatTime(currentTask.end)}</span>
                </div>
            `;
        } else {
            currentTaskCard.innerHTML = `<div class="empty-state">No active task right now</div>`;
        }

        // Render Upcoming
        upcomingTaskList.innerHTML = upcoming.map(t => createTaskHTML(t)).join('');

        // Render Previous
        previousTaskList.innerHTML = previous.map(t => createTaskHTML(t, true)).join('');
    }

    function createTaskHTML(task, isPrevious = false) {
        return `
            <div class="task-item ${isPrevious ? 'previous-list' : ''}">
                <div class="task-icon bg-${task.color.split('-')[1]}">
                    ${getIconForTask(task.name)}
                </div>
                <div class="task-info">
                    <div class="task-title">${task.name}</div>
                </div>
                <div class="task-time-range">
                    ${formatTime(task.start)} - ${formatTime(task.end)}
                </div>
                <div class="list-check ${task.completed ? 'checked' : ''}" style="border-color: var(--${task.color})"></div>
            </div>
        `;
    }

    function saveNewTask() {
        const name = document.getElementById('taskName').value;
        const color = document.querySelector('input[name="taskColor"]:checked').value;
        const startTimeStr = document.getElementById('startTime').value;
        const endTimeStr = document.getElementById('endTime').value;

        const now = new Date();
        const start = new Date();
        const [sHours, sMinutes] = startTimeStr.split(':');
        start.setHours(parseInt(sHours), parseInt(sMinutes), 0, 0);

        const end = new Date();
        const [eHours, eMinutes] = endTimeStr.split(':');
        end.setHours(parseInt(eHours), parseInt(eMinutes), 0, 0);

        // Handle Next Day logic if End < Start
        if (end < start) {
            end.setDate(end.getDate() + 1);
        }

        const newTask = {
            id: Date.now().toString(),
            name,
            color,
            start,
            end,
            completed: false
        };

        tasks.push(newTask);
        addTaskModal.classList.add('hidden');
        document.getElementById('taskName').value = ''; // Reset name
        renderTasks();
    }

    function updateTimeDisplay() {
        const now = new Date();
        const statusBarTime = document.querySelector('.status-bar span');
        if (statusBarTime) statusBarTime.innerText = formatTime(now);
    }

    function formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        // const ampm = hours >= 12 ? 'PM' : 'AM'; // Design shows 24h or simple 12 without suffix usually, but let's stick to simple
        // Design image: "9:00", "10:00" (no am/pm). But task list says "10 AM - 1 PM".
        // Let's do 12h with AM/PM for list, simple for progress.
        // Actually adhering to the image: "9:41" (header), "10 AM - 1 PM" (list).

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        // Return simplified for now, or sophisticated based on context?
        // Let's just return formatted string "10:00 AM" for now to be safe.
        return `${hours}:${minutes} ${ampm}`;
    }

    function formatTimeForInput(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
});
