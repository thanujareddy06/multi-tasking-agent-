document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    const chatForm = document.getElementById('chatForm');
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('commandInput');
        const command = input.value.trim();
        if (!command) return;

        appendMessage('user', command);
        input.value = '';

        showTypingIndicator(); // Show UI feedback the AI is thinking

        try {
            const res = await fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            appendMessage('ai', '⚠️ Error contacting TaskMaster Agent Network. Check server connection.');
        }
    });
});

async function fetchData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        renderDashboard(data);
    } catch (error) {
        console.error("Failed to load initial data:", error);
    }
}

// Global System Toasts (Separates System UI interactions from conversational LLM History)
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✅' : '⚠️';
    toast.innerHTML = `<span style="font-size:1.2rem">${icon}</span> <div style="font-size:0.9rem; font-weight:500">${message}</div>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400); // 400ms CSS animation mapping
    }, 4000);
}

// AI Typing Indicator Managers
function showTypingIndicator() {
    const typingEl = document.getElementById('typingIndicator');
    typingEl.classList.remove('hidden');
    const history = document.getElementById('chatHistory');
    history.scrollTop = history.scrollHeight;
}
function hideTypingIndicator() {
    const typingEl = document.getElementById('typingIndicator');
    typingEl.classList.add('hidden');
}


window.summarizeNotes = async function () {
    appendMessage('user', "Summarize notes");
    showTypingIndicator();
    try {
        const res = await fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: 'summarize' })
        });
        const data = await res.json();
        hideTypingIndicator();
        if (data.success) {
            appendMessage('ai', data.response);
        }
    } catch (error) {
        hideTypingIndicator();
        showToast('System Error generating summary', 'error');
    }
}

window.handleFileUpload = async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    appendMessage('user', `Uploaded document: **${file.name}**`);
    showTypingIndicator();

    const formData = new FormData();
    formData.append('document', file);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        hideTypingIndicator();

        if (data.success) {
            appendMessage('ai', data.response);
            renderDashboard(data.data);
            showToast(`Successfully extracted ${file.name}`);
        } else {
            showToast('Failed to extract document', 'error');
        }
    } catch (error) {
        hideTypingIndicator();
        appendMessage('ai', '⚠️ Error parsing binary document via Taskmaster OCR integration');
        showToast('Document parsing failed', 'error');
    }
    event.target.value = '';
}

// Modal Controllers
window.openModal = function (type, action, id = null, current1 = '', current2 = '') {
    document.getElementById('modalTitle').innerText = action === 'add' ? `Add ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById('modalType').value = type;
    document.getElementById('modalAction').value = action;
    document.getElementById('modalId').value = id || '';

    document.getElementById('modalInput1').value = current1;
    document.getElementById('modalInput1').placeholder = type === 'schedule' ? 'Event Title' : type === 'note' ? 'Note Title' : 'Task Title';

    document.getElementById('modalInput2').value = current2;
    document.getElementById('modalInput2').placeholder = type === 'schedule' ? 'Time (e.g., 2:00 PM)' : type === 'note' ? 'Note Content / Context' : 'Deadline (e.g., Tomorrow)';

    document.getElementById('modalOverlay').classList.remove('hidden');
}

window.closeModal = function () {
    document.getElementById('modalOverlay').classList.add('hidden');
}

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

    if (tabName === 'overview') {
        document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'flex');
    } else {
        document.getElementById('widget-' + tabName).style.display = 'flex';
    }
}

window.handleAction = async function (type, action, id, data1 = null, data2 = null) {
    try {
        const res = await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, action, id, data1, data2 })
        });
        const data = await res.json();

        if (data.success) {
            // Refined explicitly to Floating System Toasts rather than blocking up conversational chat history
            let msg = "";
            if (action === 'complete') msg = `Marked ${type} strictly as completed!`;
            if (action === 'delete') msg = `Purged ${type} from database sequence.`;
            if (action === 'add') msg = `Successfully injected new ${type} context.`;
            if (action === 'edit') msg = `Successfully mutated ${type} details.`;

            if (msg) showToast(msg, 'success');

            renderDashboard(data.data);
        }
    } catch (error) {
        showToast('Failure transacting state to Node process', 'error');
        console.error("Failed to execute action:", error);
    }
};

function renderDashboard(data) {
    const scheduleHtml = data.schedule.map(s => `
        <div class="list-item">
            <div class="item-title">${s.title}</div>
            <div class="item-meta">⏰ ${s.time} | 🏷️ ${s.type}</div>
            <div class="action-buttons">
                <!-- Using specific unified styling for primary and secondary actions -->
                <button class="btn-action" onclick="openModal('schedule', 'edit', ${s.id}, '${s.title.replace(/'/g, "\\'")}', '${s.time.replace(/'/g, "\\'")}')">⏰ Reschedule</button>
                <button class="btn-action" onclick="handleAction('schedule', 'delete', ${s.id})">❌ Deschedule</button>
            </div>
        </div>
    `).join('');
    document.getElementById('scheduleList').innerHTML = scheduleHtml || '<p class="item-meta" style="color:var(--text-muted)">No active calendar events found.</p>';

    const taskHtml = data.tasks.map(t => `
        <div class="list-item ${t.priority}-priority">
            <div class="item-title">${t.title}</div>
            <div class="item-meta">⏳ Due: ${t.deadline}</div>
            <div class="action-buttons">
                <button class="btn-action" onclick="handleAction('task', 'complete', ${t.id})">✅ Complete</button>
                <button class="btn-action" onclick="openModal('task', 'edit', ${t.id}, '${t.title.replace(/'/g, "\\'")}', '${t.deadline.replace(/'/g, "\\'")}')">📝 Edit Task</button>
                <button class="btn-action" onclick="handleAction('task', 'delete', ${t.id})">❌ Purge</button>
            </div>
        </div>
    `).join('');
    document.getElementById('taskList').innerHTML = taskHtml || '<p class="item-meta" style="color:var(--text-muted)">Inbox zero! No priority tasks.</p>';

    const noteHtml = data.notes.map(n => `
        <div class="list-item">
            <div class="item-title">${n.title}</div>
            <div class="item-meta">📝 ${n.preview}</div>
            <div class="action-buttons">
                <button class="btn-action" onclick="openModal('note', 'edit', ${n.id}, '${n.title.replace(/'/g, "\\'")}', '${n.preview.replace(/'/g, "\\'")}')">✏️ Amend</button>
                <button class="btn-action" onclick="handleAction('note', 'delete', ${n.id})">❌ Erase Entry</button>
            </div>
        </div>
    `).join('');
    document.getElementById('noteList').innerHTML = noteHtml || '<p class="item-meta" style="color:var(--text-muted)">Knowledge DB is empty. Upload or query to ingest.</p>';
}

function appendMessage(sender, text) {
    const history = document.getElementById('chatHistory');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;

    const formattedText = sender === 'ai'
        ? text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
        : text;

    msgDiv.innerHTML = `
        <span class="avatar">${sender === 'ai' ? '⚡' : '👤'}</span>
        <div class="message-content">${formattedText}</div>
    `;

    // Inject at the very bottom right above the typing indicator so it remains at the end
    const indicator = document.getElementById('typingIndicator');
    history.insertBefore(msgDiv, indicator);

    history.scrollTop = history.scrollHeight;
}
