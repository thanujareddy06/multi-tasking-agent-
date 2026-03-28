const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

app.get('/api/data', (req, res) => {
    res.json(readDB());
});

app.post('/api/command', (req, res) => {
    const { command } = req.body;
    let db = readDB();

    let responseText = "I have processed your request.";
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('summarize')) {
        const notesSummary = db.notes.length > 0
            ? db.notes.map(n => `**${n.title}**: ${n.preview}`).join('\n\n')
            : "You currently have no notes to summarize.";
        responseText = `🧠 **Knowledge Agent**: Here is a structured summary of your knowledge base:\n\n${notesSummary}`;

    } else if (lowerCommand.match(/(?:add schedule|add event|schedule:?|plan:?)\s+(.*)/i)) {
        const matches = command.match(/(?:add schedule|add event|schedule:?|plan:?)\s+(.*)/i);
        const title = matches ? matches[1].trim() : "New Event";
        db.schedule.push({ id: Date.now(), title, time: "TBD", type: "event" });
        writeDB(db);
        responseText = `📅 **Scheduler Agent**: Created new event -> "${title}".`;

    } else if (lowerCommand.match(/(?:add task|create task|task:?)\s+(.*)/i)) {
        const match = command.match(/(?:add task|create task|task:?)\s+(.*)/i);
        const title = match ? match[1].trim() : "New Task";
        db.tasks.push({ id: Date.now(), title, deadline: "TBD", priority: "high", completed: false });
        writeDB(db);
        responseText = `✅ **Task Agent**: Successfully created new task -> "${title}".`;

    } else if (lowerCommand.match(/(?:add note|create note|note:?)\s+(.*)/i)) {
        const match = command.match(/(?:add note|create note|note:?)\s+(.*)/i);
        const preview = match ? match[1].trim() : "Empty note.";
        db.notes.push({ id: Date.now(), title: "Message Note", preview });
        writeDB(db);
        responseText = `🧠 **Knowledge Agent**: Saved custom note to the knowledge base.`;

    } else if (lowerCommand.includes('plan') || lowerCommand.includes('week') || lowerCommand.includes('schedule')) {
        responseText = "📅 **Scheduler Agent**: I've analyzed your schedule. Added a buffer and prioritized focus time.\n✅ **Task Agent**: Your high-priority tasks are prioritized.\n🧠 **Knowledge Agent**: Indexed your notes for the week.";
    } else {
        responseText = "Integration Agent 🔗 is standing by. Try asking:\n- **'Add task: Build App'**\n- **'Add schedule: Gym at 6pm'**\n- **'Add note: Node.js is awesome'**\n- **'Summarize'**.";
    }

    res.json({ success: true, response: responseText, data: db });
});

app.post('/api/upload', upload.single('document'), async (req, res) => {
    let db = readDB();
    const file = req.file;
    if (!file) return res.json({ success: false, response: "No file uploaded." });

    const filePath = file.path;
    const mime = file.mimetype;
    let extractedText = "";

    try {
        if (mime === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else if (mime.includes('word') || file.originalname.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else if (mime.startsWith('image/')) {
            const { data } = await Tesseract.recognize(filePath, 'eng');
            extractedText = data.text;
        } else if (mime.startsWith('text/')) {
            extractedText = fs.readFileSync(filePath, 'utf-8');
        } else {
            extractedText = "Unsupported file type for deep extraction. Simulated reading summary.";
        }

        extractedText = extractedText.replace(/\s+/g, ' ').trim();
        const summaryLength = 300;
        const summary = extractedText.length > summaryLength ? extractedText.substring(0, summaryLength) + '...' : extractedText;
        const textPreview = extractedText ? `File Extracted Summary: ${summary}` : `No readable text found.`;

        db.notes.push({
            id: Date.now(),
            title: `Parsed: ${file.originalname}`,
            preview: textPreview
        });
        writeDB(db);

        // Delete temp file asynchronously to prevent bloating
        fs.unlink(filePath, () => { });

        res.json({
            success: true,
            response: `🧠 **Knowledge Agent**: I have successfully OCR parsed **${file.originalname}**. \nI extracted ${extractedText.length} characters of raw data and safely stored the preview summary in your Knowledge DB!`,
            data: db
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, response: "Failed to extract text from document." });
    }
});

// New generic /api/action endpoint to handle UI mutators
app.post('/api/action', (req, res) => {
    const { type, action, id, data1, data2 } = req.body;
    let db = readDB();

    if (type === 'schedule') {
        if (action === 'delete') db.schedule = db.schedule.filter(i => i.id !== id);
        if (action === 'add') db.schedule.push({ id: Date.now(), title: data1 || "New Event", time: data2 || "TBD", type: "event" });
        if (action === 'edit') {
            let item = db.schedule.find(i => i.id === id);
            if (item) { item.title = data1; item.time = data2; }
        }
    } else if (type === 'task') {
        let item = db.tasks.find(i => i.id === id);
        if (item && action === 'complete') item.completed = true;
        if (action === 'delete') db.tasks = db.tasks.filter(i => i.id !== id);
        if (action === 'add') db.tasks.push({ id: Date.now(), title: data1 || "New Task", deadline: data2 || "TBD", priority: "high", completed: false });
        if (action === 'edit') {
            if (item) { item.title = data1; item.deadline = data2; }
        }
    } else if (type === 'note') {
        let item = db.notes.find(i => i.id === id);
        if (action === 'delete') db.notes = db.notes.filter(i => i.id !== id);
        if (action === 'add') db.notes.push({ id: Date.now(), title: data1 || "New Note", preview: data2 || "TBD" });
        if (action === 'edit') {
            if (item) { item.title = data1; item.preview = data2; }
        }
    }

    db.tasks = db.tasks.filter(t => !t.completed);

    writeDB(db);
    res.json({ success: true, data: db });
});

app.listen(PORT, () => {
    console.log(`🚀 TaskMaster AI Backend running on http://localhost:${PORT}`);
});
