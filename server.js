const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your HTML/CSS/JS automatically

// File Paths
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const ITEMS_FILE = path.join(__dirname, 'data', 'items.json');

// --- HELPER FUNCTIONS ---
// Ensures the app doesn't crash if files are missing
const initFiles = () => {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'));
    }
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
    if (!fs.existsSync(ITEMS_FILE)) fs.writeFileSync(ITEMS_FILE, '[]');
};
initFiles();

const getData = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const saveData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// --- ROUTES ---

// 1. GET ALL ITEMS
app.get('/items', (req, res) => {
    try {
        const items = getData(ITEMS_FILE);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Could not load items" });
    }
});

// 2. REGISTER USER
app.post('/register', (req, res) => {
    const { username, phone, password } = req.body;
    let users = getData(USERS_FILE);

    if (users.find(u => u.phone === phone)) {
        return res.json({ success: false, message: "User already exists!" });
    }

    users.push({ username, phone, password });
    saveData(USERS_FILE, users);
    res.json({ success: true });
});

// 3. LOGIN USER
app.post('/login', (req, res) => {
    const { phone, password } = req.body;
    const users = getData(USERS_FILE);
    const user = users.find(u => u.phone === phone && u.password === password);

    if (user) {
        res.json({ success: true, user: { username: user.username, phone: user.phone } });
    } else {
        res.json({ success: false, message: "Invalid credentials" });
    }
});

// 4. ADD ITEM
app.post('/add-item', (req, res) => {
    try {
        const newItem = req.body;
        let items = getData(ITEMS_FILE);
        
        // Add to the beginning of the list (newest first)
        items.unshift(newItem); 
        
        saveData(ITEMS_FILE, items);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is flying at http://localhost:${PORT}`);
});
