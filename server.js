const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Setup Folders & Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');



// Ensure folders exist
[DATA_DIR, UPLOADS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
if (!fs.existsSync(POSTS_FILE)) fs.writeFileSync(POSTS_FILE, '[]');

// 2. Image Upload Configuration
const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 3. Helper Functions
const getData = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const saveData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// --- ROUTES ---

// Get All Posts (for the Market page)
app.get('/posts', (req, res) => {
    res.json(getData(POSTS_FILE));
});

// Register
app.post('/register', (req, res) => {
    const { username, phone, password } = req.body;
    let users = getData(USERS_FILE);
    if (users.find(u => u.phone === phone)) return res.json({ success: false, message: "User exists!" });
    users.push({ username, phone, password });
    saveData(USERS_FILE, users);
    res.json({ success: true });
});

// Login
app.post('/login', (req, res) => {
    const { phone, password } = req.body;
    const user = getData(USERS_FILE).find(u => u.phone === phone && u.password === password);
    if (user) res.json({ success: true, user: { username: user.username, phone: user.phone } });
    else res.json({ success: false });
});

// Add Item with Image
app.post('/posts', upload.single('image'), (req, res) => {
    try {
        const posts = getData(POSTS_FILE);
        const newPost = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            seller: req.body.seller,
            phone: req.body.phone,
            imageUrl: `/uploads/${req.file.filename}`,
            date: new Date().toLocaleString()
        };
        posts.unshift(newPost); // Newest first
        saveData(POSTS_FILE, posts);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => console.log(`🚀 Server flying at port ${PORT}`));

