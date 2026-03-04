require('dotenv').config();
const express = require('express');
const cors = require('cors');
const linkRoutes = require('./routes/links');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/links', linkRoutes);

//logix 

// init the server 
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

// redirect route (good for broken links, auth, set temp index ..ect)
const { pool } = require('./db');

app.get('/:code', async (req, res) => {
    const { code } = req.params;

    try {
        const result = await pool.query(
            'SELECT original_url FROM links WHERE short_code = $1', 
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Short link not found :/' });
        }

        res.redirect(301, result.rows[0].original_url);

    } catch (err) {
        console.error('Redirect error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
