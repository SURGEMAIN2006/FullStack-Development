const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./config/db');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const booksRoutes = require('./routes/books.routes');
const categoriesRoutes = require('./routes/categories.routes');
const usersRoutes = require('./routes/users.routes');
const issuesRoutes = require('./routes/issues.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationsRoutes = require('./routes/notifications.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationsRoutes);

// Root route check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LibraSphere Library API is operational.' });
});

// Serve frontend build static files if present in production
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
if (require('fs').existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Express Error]:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start Server after Database connection
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 LibraSphere Backend API running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);
    });
  })
  .catch((err) => {
    console.error('Fatal: Failed to initialize database server.', err);
    process.exit(1);
  });
