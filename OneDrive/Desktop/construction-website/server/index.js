const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'construction_db',
};

// Mock Database wrapper (replace with real connection if creds are provided)
// Ideally we create a connection pool
let pool;

async function initDB() {
    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
        console.log('Running without database connection (mock mode might be needed)');
    }
}

initDB();

// Routes

// Get all services
app.get('/api/services', async (req, res) => {
    try {
        if (!pool) throw new Error('No DB connection');
        const [rows] = await pool.query('SELECT * FROM services');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Manage Services (Create, Update, Delete)
app.post('/api/services', auth, async (req, res) => {
    const { title, description, icon, image_url } = req.body;
    try {
        await pool.query('INSERT INTO services (title, description, icon, image_url) VALUES (?, ?, ?, ?)', [title, description, icon, image_url]);
        res.json({ success: true, message: 'Service created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put('/api/services/:id', auth, async (req, res) => {
    const { title, description, icon, image_url } = req.body;
    try {
        await pool.query('UPDATE services SET title = ?, description = ?, icon = ?, image_url = ? WHERE id = ?', [title, description, icon, image_url, req.params.id]);
        res.json({ success: true, message: 'Service updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/services/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Service deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        if (!pool) throw new Error('No DB connection');
        const [rows] = await pool.query('SELECT * FROM projects');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Manage Projects
app.post('/api/projects', auth, async (req, res) => {
    const { title, description, category, image_url, location, completion_date } = req.body;
    try {
        await pool.query('INSERT INTO projects (title, description, category, image_url, location, completion_date) VALUES (?, ?, ?, ?, ?, ?)', [title, description, category, image_url, location, completion_date]);
        res.json({ success: true, message: 'Project created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;
    try {
        if (!pool) throw new Error('No DB connection');
        await pool.query('INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)', [name, email, phone, message]);
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!(username && password)) {
            res.status(400).send("All input is required");
        }

        if (!pool) throw new Error('No DB connection');
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user.id, username },
                process.env.JWT_SECRET,
                { expiresIn: "2h" }
            );

            user.token = token;
            res.status(200).json(user);
        } else {
            res.status(400).send("Invalid Credentials");
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Messages (Protected)
app.get('/api/messages', auth, async (req, res) => {
    try {
        if (!pool) throw new Error('No DB connection');
        const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
