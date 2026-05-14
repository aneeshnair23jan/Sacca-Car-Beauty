const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Initialize DB
const { getDb } = require('./db');
getDb().then(() => console.log('Database initialized')).catch(console.error);

const requireAuth = require('./middleware/auth');

// Middleware: protect write operations on products & categories
// GET requests are public (store needs to read products/categories)
// POST, PUT, DELETE require a valid admin token
function authForWrites(req, res, next) {
  if (req.method === 'GET') return next();
  return requireAuth(req, res, next);
}

// Public auth route
app.use('/api/auth', require('./routes/auth'));

// Products & categories: reads are public, writes are protected
app.use('/api/products', authForWrites, require('./routes/products'));
app.use('/api/categories', authForWrites, require('./routes/categories'));

// Settings: fully protected (admin only)
app.use('/api/settings', requireAuth, require('./routes/settings'));

// Serve frontend in production
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Sacca Car Beauty server running on http://localhost:${PORT}`);
});