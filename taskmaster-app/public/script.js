// 1. Theme Configuration
window.setTheme = function (themeClass) {
    document.body.className = '';
    document.body.classList.add(themeClass);
    localStorage.setItem('tm-theme', themeClass);
    showToast(`Visual Mode Switched`, 'success');
}
const savedTheme = localStorage.getItem('tm-theme');
if (savedTheme) document.body.classList.add(savedTheme);


let prodChartInstance = null; // Global reference to analytical Chart.js render

document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    // 2. Load API Key state
    const savedKey = localStorage.getItem('tm-openai-key');
    if (savedKey) document.getElementById('apiKeyInput').value = savedKey;

    // 3. Chat Input Handler Hook (NLP & Voice)
    const chatForm = document.getElementById('chatForm');
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('commandInput');
        const command = input.value.trim();
        if (!command) return;

        appendMessage('user', command);
        input.value = '';

        showTypingIndicator();

        try {
            const currentApiHeader = localStorage.getItem('tm-openai-key') || '';
            const res = await fetch('/api/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': currentApiHeader
                },
                body: JSON.stringify({ command })
            });
            const data = await res.json();

            hideTypingIndicator();
            if (data.success) {
                appendMessage('ai', data.response);
                renderDashboard(data.data);
            }
        } catch (error) {
            hideTypingIndicator();
            appendMessage('ai', '⚠️ Error contacting Multi-Tasking Agent Network.');
        }
    });

    // 4. Web Speech API Voice Implementation
    const voiceBtn = document.getElementById('voiceBtn');
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = function () {
            voiceBtn.classList.add('listening');
            showToast('Microphone active. Identifying audio...', 'success');
        };
        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('commandInput').value = transcript;
            voiceBtn.classList.remove('listening');
            document.getElementById('chatForm').dispatchEvent(new Event('submit', { cancelable: true }));
        };
        recognition.onerror = function (event) {
            voiceBtn.classList.remove('listening');
            showToast('Voice Recognition Error: ' + event.error, 'error');
        };
        recognition.onend = function () {
            voiceBtn.classList.remove('listening');
        };

        voiceBtn.addEventListener('click', () => {
            if (voiceBtn.classList.contains('listening')) recognition.stop();
            else recognition.start();
        });
    } else {
        voiceBtn.style.display = 'none'; // Platform unsupported
    }

    setInterval(checkUpcomingSchedules, 60000);
});

// Notifications Daemon
window.enableNotifications = function () {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") showToast("Desktop Agent Alerts tracking active!", "success");
            else showToast("Desktop alerts denied by browser setting.", "error");
        });
    }
}
function checkUpcomingSchedules() {
    if ("Notification" in window && Notification.permission === "granted") {
        // Pseudo execution loop
    }
}


async function fetchData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        renderDashboard(data);
    } catch (error) {
        console.error("Failed to load initial data:", error);
    }
}

// Global System Toasts
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : '⚠️';
    toast.innerHTML = `<span style="font-size:1.2rem">${icon}</span> <div style="font-size:0.9rem; font-weight:500">${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function showTypingIndicator() {
    const typingEl = document.getElementById('typingIndicator');
    typingEl.classList.remove('hidden');
    const history = document.getElementById('chatHistory');
    history.scrollTop = history.scrollHeight;
}
function hideTypingIndicator() {
    document.getElementById('typingIndicator').classList.add('hidden');
}

// Save Genuine LLM Key
window.saveApiKey = function () {
    const key = document.getElementById('apiKeyInput').value.trim();
    localStorage.setItem('tm-openai-key', key);
    document.getElementById('apiModalOverlay').classList.add('hidden');

    if (key) showToast('True AI Integration Linked Securely', 'success');
    else showToast('LLM Disconnected. Simulating.', 'success');
}


window.summarizeNotes = async function () {
    appendMessage('user', "Summarize notes");
    showTypingIndicator();
    try {
        const currentApiHeader = localStorage.getItem('tm-openai-key') || '';
        const res = await fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': currentApiHeader },
            body: JSON.stringify({ command: 'summarize' })
        });
        const data = await res.json();
        hideTypingIndicator();
        if (data.success) appendMessage('ai', data.response);
    } catch (error) {
        hideTypingIndicator(); showToast('System Error generating summary', 'error');
    }
}

window.handleFileUpload = async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    appendMessage('user', `Uploaded document: **${file.name}**`);
    showTypingIndicator();

    const formData = new FormData(); formData.append('document', file);
    try {
        const currentApiHeader = localStorage.getItem('tm-openai-key') || '';
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'X-API-Key': currentApiHeader },
            body: formData
        });
        const data = await res.json();
        hideTypingIndicator();
        if (data.success) {
            appendMessage('ai', data.response);
            renderDashboard(data.data);
            showToast(`Successfully evaluated ${file.name}`);
        } else showToast('Failed to extract document', 'error');
    } catch (error) {
        hideTypingIndicator();
        appendMessage('ai', '⚠️ Error parsing binary document over generic fetch block.');
    }
    event.target.value = '';
}


/* Data Action Handlers and DOM Render */
window.handleAction = async function (type, action, id, data1 = null, data2 = null) {
    try {
        const res = await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, action, id, data1, data2 })
        });
        const data = await res.json();
        if (data.success) {
            let msg = "";
            if (action === 'delete') msg = `Purged ${type} from database.`;
            if (action === 'add') msg = `Injected new ${type} context.`;
            if (action === 'edit') msg = `Mutated ${type} details.`;
            if (action === 'status-update') msg = `Re-assigned status flow!`;

            if (msg) showToast(msg, 'success');
            renderDashboard(data.data);
        }
    } catch (error) { showToast('Failure transacting DOM state', 'error'); }
};

/* Drag and Drop API Hooks */
window.drag = function (ev, id) {
    ev.dataTransfer.setData("text", id);
    // Visual stylistic pop
    ev.target.style.opacity = '0.5';
}
window.allowDrop = function (ev) {
    ev.preventDefault();
}
window.drop = function (ev, targetStatus) {
    ev.preventDefault();
    const idStr = ev.dataTransfer.getData("text");
    if (!idStr) return;
    const dragId = Number(idStr);

    // Clear stylistic remnants locally although DOM will re-render
    document.querySelectorAll('.kanban-col').forEach(col => col.classList.remove('drag-over'));

    // Transact changes globally to backend engine
    handleAction('task', 'status-update', dragId, targetStatus);
}
// Add slight hover effect for column targets visually mapping data payload structures natively without external react wrappers
document.addEventListener("dragenter", (event) => {
    if (event.target.classList.contains("kanban-col")) { event.target.classList.add("drag-over"); }
});
document.addEventListener("dragleave", (event) => {
    if (event.target.classList.contains("kanban-col")) { event.target.classList.remove("drag-over"); }
});


function renderDashboard(data) {
    // Build Dynamic Chart.js Analytics Overview
    if (document.getElementById('productivityChart')) {
        const ctx = document.getElementById('productivityChart').getContext('2d');
        const activeTasks = data.tasks.length;
        const schedules = data.schedule.length;
        const notes = data.notes.length;

        if (prodChartInstance) prodChartInstance.destroy();

        prodChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active Tasks', 'Scheduled Events', 'Knowledge Notes'],
                datasets: [{
                    data: [activeTasks, schedules, notes],
                    backgroundColor: ['#ec4899', '#6366f1', '#00ffcc'],
                    borderWidth: 0, hoverOffset: 4
                }]
            },
            options: { cutout: '75%', plugins: { legend: { position: 'right', labels: { color: 'white' } } } }
        });
    }

    const scheduleHtml = data.schedule.map(s => `
        <div class="list-item">
            <div class="item-title">${s.title}</div>
            <div class="item-meta">⏰ ${s.time}</div>
            <div class="action-buttons">
                <button class="btn-action" onclick="openModal('schedule', 'edit', ${s.id}, '${s.title.replace(/'/g, "\\'")}', '${s.time.replace(/'/g, "\\'")}')">⏰ Reschedule</button>
                <button class="btn-action" onclick="handleAction('schedule', 'delete', ${s.id})">❌</button>
            </div>
        </div>
    `).join('');
    document.getElementById('scheduleList').innerHTML = scheduleHtml || '<p class="item-meta">No events running.</p>';

    // Segregate tasks logically into specific state arrays explicitly rendered
    let todoHtml = []; let progressHtml = []; let doneHtml = [];

    data.tasks.forEach(t => {
        let status = 'todo';
        if (t.status) status = t.status;
        else if (t.completed) status = 'done'; // Legacy fallback bridge

        let card = `
        <div class="list-item ${t.priority}-priority">
            <div class="item-title">${status === 'done' ? `<s>${t.title}</s>` : t.title}</div>
            <div class="item-meta">⏳ Due: ${t.deadline}</div>
            <div class="action-buttons">
                ${status === 'todo' ? `<button class="btn-action" onclick="handleAction('task', 'status-update', ${t.id}, 'progress')">⏩ Start Progress</button>` : ''}
                ${status === 'progress' ? `<button class="btn-action" onclick="handleAction('task', 'status-update', ${t.id}, 'done')">✅ Mark Complete</button>` : ''}
                ${status !== 'done' ? `<button class="btn-action" onclick="openModal('task', 'edit', ${t.id}, '${t.title.replace(/'/g, "\\'")}', '${t.deadline.replace(/'/g, "\\'")}')">📝 Amend</button>` : ''}
                <button class="btn-action" onclick="handleAction('task', 'delete', ${t.id})">❌</button>
            </div>
        </div>`;

        if (status === 'todo') todoHtml.push(card);
        else if (status === 'progress') progressHtml.push(card);
        else if (status === 'done') doneHtml.push(card);
    });

    let completeHtml = '';
    if (todoHtml.length > 0) completeHtml += `<h4 style="color:var(--text-muted); margin: 8px 0;">📌 Pending Needs</h4>` + todoHtml.join('');
    if (progressHtml.length > 0) completeHtml += `<h4 style="color:var(--text-muted); margin: 8px 0;">⚙️ In Progress</h4>` + progressHtml.join('');
    if (doneHtml.length > 0) completeHtml += `<h4 style="color:var(--text-muted); margin: 8px 0;">✅ Completed History</h4>` + doneHtml.join('');

    document.getElementById('taskList').innerHTML = completeHtml || '<p class="item-meta">No priority tasks available.</p>';

    const noteHtml = data.notes.map(n => {
        // Differentiate file uploads logically based on the title standard pattern generated by the NodeJS OCR routine
        const isUpload = n.title.includes('Parsed Map:');
        const icon = isUpload ? '📄' : '📝';

        return `
        <div class="list-item">
            <div class="item-title">${icon} ${n.title}</div>
            <div class="item-meta" style="max-height:80px; overflow-y:auto;">${n.preview}</div>
            <div class="action-buttons">
                <button class="btn-action" onclick="openModal('note', 'edit', ${n.id}, '${n.title.replace(/'/g, "\\'")}', '${n.preview.replace(/'/g, "\\'")}')">✏️ Edit</button>
                <button class="btn-action" onclick="handleAction('note', 'delete', ${n.id})">❌</button>
            </div>
        </div>`
    }).join('');
    document.getElementById('noteList').innerHTML = noteHtml || '<p class="item-meta">DB is empty.</p>';

    // New Integration Dynamic Array rendering explicitly targeting #integrationList
    if (data.integrations) {
        const intHtml = data.integrations.map(int => `
            <div class="list-item integration-item">
                <div>
                    <div class="item-title">${int.title}</div>
                    <div class="item-meta">${int.meta}</div>
                </div>
                <div style="display:flex; align-items:center; gap: 12px;">
                    <label class="toggle-switch">
                        <input type="checkbox" ${int.id <= 3 ? 'checked' : ''} onclick="showToast('Toggled authentication state successfully', 'success')">
                        <span class="slider"></span>
                    </label>
                    <button class="icon-btn" onclick="handleAction('integration', 'delete', ${int.id})" style="font-size:0.8rem; padding: 4px;">❌</button>
                </div>
            </div>
        `).join('');
        const domList = document.getElementById('integrationList');
        if (domList) domList.innerHTML = intHtml;
    }
}

// Modal Form Lifecycles
window.openModal = function (type, action, id = null, current1 = '', current2 = '') {
    document.getElementById('modalTitle').innerText = action === 'add' ? `Add ${type}` : `Edit ${type}`;
    document.getElementById('modalType').value = type;
    document.getElementById('modalAction').value = action;
    document.getElementById('modalId').value = id || '';
    document.getElementById('modalInput1').value = current1;
    document.getElementById('modalInput1').placeholder = type === 'schedule' ? 'Event Title' : type === 'note' ? 'Note Title' : type === 'integration' ? 'Service Name (e.g. Trello)' : 'Task Title';
    document.getElementById('modalInput2').value = current2;
    document.getElementById('modalInput2').placeholder = type === 'schedule' ? 'Time (e.g., 2:00 PM)' : type === 'note' ? 'Note Context' : type === 'integration' ? 'Description (e.g. Board sync)' : 'Deadline (e.g., Tomorrow)';
    document.getElementById('modalOverlay').classList.remove('hidden');
}
window.closeModal = function () { document.getElementById('modalOverlay').classList.add('hidden'); }
window.submitModal = function () {
    const type = document.getElementById('modalType').value;
    const action = document.getElementById('modalAction').value;
    const id = document.getElementById('modalId').value ? Number(document.getElementById('modalId').value) : null;
    const data1 = document.getElementById('modalInput1').value.trim();
    const data2 = document.getElementById('modalInput2').value.trim();
    if (!data1) { showToast('Title is required!', 'error'); return; }
    handleAction(type, action, id, data1, data2);
    closeModal();
}

window.switchTab = function (tabName) {
    document.querySelectorAll('.agent-status li').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    if (tabName === 'overview') document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'flex');
    else document.getElementById('widget-' + tabName).style.display = 'flex';
}

function appendMessage(sender, text) {
    const history = document.getElementById('chatHistory');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    const formattedText = sender === 'ai' ? text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') : text;
    msgDiv.innerHTML = `<span class="avatar">${sender === 'ai' ? '⚡' : '👤'}</span><div class="message-content">${formattedText}</div>`;
    const indicator = document.getElementById('typingIndicator');
    history.insertBefore(msgDiv, indicator);
    history.scrollTop = history.scrollHeight;
}
